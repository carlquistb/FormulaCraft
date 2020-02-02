/*
Develop date: 6/8

Description: First version of function to retrieve stack information.

paramenters:
  none.
output:
  {
    numStacks: int
    stacks: [
      stackId: string
      stackName: string
      stackCreationTime: string
      stackStatus: string
      stackIPs: array [string]
    ]
  }

*/

const aws = require('aws-sdk');

const cfn = new aws.CloudFormation();

exports.handler = async (event, context, callback) => {

    let params = {
      StackStatusFilter: ['CREATE_COMPLETE', 'CREATE_IN_PROGRESS', 'DELETE_IN_PROGRESS']
    };

    console.log('querying current stacks');

    let listStacksData;

    try {
      listStacksData = await cfn.listStacks(params).promise();
    }
    catch (err) {
      console.log(err, err.stack);

      //define and return response
      let response = {
        isBase64Encoded: true,
        statusCode: 400,
        headers: {
          "x-custom-header" : "my custom header value",
          'Access-Control-Allow-Origin':'*',
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({})
      };

      callback(err, response);
      return;
    }

    console.log("logging number of retreived stacks");
    console.log(listStacksData.StackSummaries.length);
    console.log(listStacksData.StackSummaries);

    let stacks = await Promise.all(
    	listStacksData.StackSummaries.map(parseStackInfo)
    );

    //define and return HTTP response
    let responseBody = {
      numStacks: listStacksData.StackSummaries.length,
      stacks: stacks
    };

    let response = {
      isBase64Encoded: true,
      statusCode: 200,
      headers: {
        "x-custom-header" : "my custom header value",
        'Access-Control-Allow-Origin':'*',
        "Content-Type" : "application/json"
      },
      body: JSON.stringify(responseBody)
    };

    console.log("logging response");
    console.log("resonse: ", response);

    callback(null, response);

}

async function parseStackInfo(summary) {
	//list stack resources
	console.log('logging id of each stack: ' + summary.StackId);
	let stackIps = await getStackIps(summary.StackId, summary.StackStatus);
	console.log("stackIps: ", stackIps);
	return {
		stackId: summary.StackId,
		stackName: summary.StackName,
		stackCreationTime: summary.CreationTime,
		stackStatus: summary.StackStatus,
		stackIps: stackIps
	};
}

//returns array of Strings representing public ipv4 addresses for the stack.
async function getStackIps(stackId, stackStatus) {

  //ONLY attempt to fetch IPs of currently active stacks.
  if(stackStatus != "CREATE_COMPLETE") {
    return (null);
  }

  let listStackResourcesParams = {
    StackName: stackId
  };

  let resourcesData;

  //TODO: error handling
  try {
    resourcesData = await cfn.listStackResources(listStackResourcesParams).promise();
  }
  catch (err){
    console.log(err, err.stack);
    return;
  }

  //find the resources with type AWS::EC2::SpotFleet (expected: 1)

  let spotfleets = resourcesData.StackResourceSummaries.filter(function(resource) {
    return resource.ResourceType === 'AWS::EC2::SpotFleet';
  });

  if(spotfleets.length > 1) {
    console.log("ERROR: stack contains more than one spotfleet resource. Each stack is expected to have a single spotfleet resource.");
    return;
  }

  if(spotfleets.length < 1) {
    console.log("ERROR: stack contains less than one spotfleet resource. Each stack is expected to have a single spotfleet resource.");
    return;
  }

  let spotfleet = spotfleets[0];

  //get the ips of all instances (expected: 1) in the spotfleet
  let ec2 = new aws.EC2();
  let describeSpotFleetInstancesParams = {
    SpotFleetRequestId: spotfleet.PhysicalResourceId
  };

  let describeSpotFleetInstancesData;

  try{
    describeSpotFleetInstancesData = await ec2.describeSpotFleetInstances(describeSpotFleetInstancesParams).promise();
  }
  catch (err) {
    console.log(err, err.stack);
    return;
  }

  if(describeSpotFleetInstancesData.ActiveInstances.length != 1) {
    console.log("ERROR: spotfleet contains " + describeSpotFleetInstancesData.ActiveInstances.length + "instances. Each spotfleet is expected to have a single instance.");
    return;
  }

  let describeInstancesparams = {
      InstanceIds: [describeSpotFleetInstancesData.ActiveInstances[0].InstanceId]
  };

  let describeInstancesData;

  try{
    describeInstancesData = await ec2.describeInstances(describeInstancesparams).promise();
  }
  catch (err) {
    console.log(err, err.stack);
  }

  let ips = describeInstancesData.Reservations[0].Instances.map(function(instance) {return instance.PublicIpAddress;});

  console.log("logging ip");
  console.log("ip:",ips[0]);

  return(ips);
}
