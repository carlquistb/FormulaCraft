/*
Develop date: 6/8

Description: First version of function to retrieve stack information.

paramenters:

output:
  {
    numStacks: int
    stacks: [
      stackName: string
      stackCreationTime: string
      stackIPaddress: string
    ]
  }

*/

const aws = require('aws-sdk');

const cfn = new aws.CloudFormation();

exports.handler = (event, context, callback) => {

    var params = {
        StackStatusFilter: ['CREATE_COMPLETE', 'CREATE_IN_PROGRESS', 'DELETE_IN_PROGRESS']
    };

    console.log('querying current stacks');
    cfn.listStacks(params, createListStacksHandler(callback));

};

function createListStacksHandler(callback) {
    return function(err, data) {
        if (err) {
            console.log(err, err.stack);

            //define and return response
            let response = {
                isBase64Encoded: true,
                statusCode: 400,
                headers: {},
                body: JSON.stringify({})
            };

            callback(err, response);
            return;
        }
        //method success callback fn
        console.log("logging number of retreived stacks");
        console.log(data.StackSummaries.length);
        console.log(data.StackSummaries);

        let stacks = data.StackSummaries.map(function(summary) {
            //list stack resources
            console.log('print id of each stackSummary: ' + summary.StackId);

            return {
              stackId: summary.StackId,
              stackName: summary.StackName,
              stackCreationTime: summary.CreationTime,
              stackIps: getStackIps(summary.StackId)
            };

        });

        //define and return HTTP response
        let responseBody = {
          numStacks: data.StackSummaries.length,
          stacks: stacks
        };

        let response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {},
            body: JSON.stringify(responseBody)
        };

        callback(null, response);
    }
}

function getStackIps(stackId) {

  let params = {
      StackName: stackId
  };

  var ips;

  cfn.listStackResources(params, createListStackResourcesHandler(ips));

  return ips;
}

function createListStackResourcesHandler(ips) {
  return function(err, data) {
    if (err) {
        console.log(err, err.stack);
        return;
    }

    //find the resources with type AWS::EC2::SpotFleet (expected: 1)
    let spotfleets = data.StackResourceSummaries.filter(function(resource) {
        return resource.ResourceType === 'AWS::EC2::SpotFleet';

    });

    if(spotfleets.length > 1) {
      console.log("ERROR: stack contains more than one spotfleet resource. Each stack is expected to have a single spotfleet resource.");
      return;
    }

    let spotfleet = spotfleets[0];

    //get the ips of all instances (expected: 1) in the spotfleet
    var ec2 = new aws.EC2();
    let params = {
      SpotFleetRequestId: spotfleet.PhysicalResourceId
    };
    ec2.describeSpotFleetInstances(params, createSpotFleetDescriberHandler(ec2, ips));

  }
}

function createSpotFleetDescriberHandler(ec2, ips) {
    return function(err, data) {
        if (err) {
            console.log(err, err.stack);
            return;
        }

        console.log(data.ActiveInstances);

        var params = {
            InstanceIds: [data.ActiveInstances[0].InstanceId]
        };

        ec2.describeInstances(params, createDescribeInstanceHandler(ips));
    }
}

function createDescribeInstanceHandler(ips) {
  return function(err, data) {
    if (err) console.log(err, err.stack);
    else {
        console.log('describing instances');
        console.log(data);
        console.log('logging IP address');
        console.log(data.Reservations[0].Instances[0].PublicIpAddress);

        ips = data.Reservations[0].Instances.map(function(instance) {return instance.PublicIpAddress;});
    }
  }
}
