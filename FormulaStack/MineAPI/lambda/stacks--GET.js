/*
Develop date: 6/8

Description: First version of function to retrieve stack information.

paramenters:

output:
  stackName
  stackCreationTime

*/

exports.handler = (event, context, callback) => {

    const aws = require('aws-sdk');

    const cfn = new aws.CloudFormation();

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

            var response = {
                isBase64Encoded: true,
                statusCode: 400,
                headers: {},
                body: JSON.stringify({})
            };

            callback(err, response);
        } else { //method success callback fn
            console.log(data.StackSummaries);

            //define and return HTTP response

            var body = data.StackSummaries;

            const response = {
                isBase64Encoded: true,
                statusCode: 200,
                headers: {},
                body: JSON.stringify(body)
            };

            var summary;
            for (summary of data.StackSummaries) {

                //list stack resources
                console.log('print id of each stackSummary: ' + summary.StackId);
                var listResourceParams = {
                    StackName: summary.StackId
                };

                cfn.listStackResources(listResourceParams, createListStackResourcesHandler(callback));

            }

            callback(null, response);
        }

    }
}

function createListStackResourcesHandler(callback) {
    return function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            //find the resource with type AWS::EC2::SpotFleet
            data.StackResourceSummaries.filter(function(resource) {
                return item.ResourceType === 'AWS::EC2::SpotFleet';

            }).forEach(describeSpotFleetInstance);
        }
    }
}

function describeSpotFleetInstance(resource) {
    console.log(resource.PhysicalResourceId);
    //describe the instances inside the fleet
    var ec2 = new aws.EC2();
    params = {
        SpotFleetRequestId: resource.PhysicalResourceId
    };
    console.log('params:', resource.PhysicalResourceId);
    ec2.describeSpotFleetInstances(params, spotFleetDescriber);
}

function spotFleetDescriberHandler(err, data) {
    if (err) {
        console.log(err, err.stack);
    } else {
        console.log(data.ActiveInstances);

        params = {
            InstanceIds: [data.ActiveInstances[0].InstanceId]
        };

        ec2.describeInstances(params, function(err, data) {
            if (err) console.log(err, err.stack);
            else {
                console.log('describing instances');
                console.log(data);
                console.log(data.Reservations[0].Instances);
            }
        });
    }
}