/*
Develop date: 6/8

Description: First version of function to retrieve stack information.

paramenters:

output:
  stackName
  stackCreationTime

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
        console.log(data.StackSummaries);

        data.StackSummaries.forEach(function(summary) {
            //list stack resources
            console.log('print id of each stackSummary: ' + summary.StackId);
            let listResourceParams = {
                StackName: summary.StackId
            };

            cfn.listStackResources(listResourceParams, listStackResources);
        });

        //define and return HTTP response
        let body = data.StackSummaries;
        let response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {},
            body: JSON.stringify(body)
        };

        callback(null, response);
    }
}

function listStackResources(err, data) {
    if (err) {
        console.log(err, err.stack);
        return;
    }

    //find the resource with type AWS::EC2::SpotFleet
    data.StackResourceSummaries.filter(function(resource) {
        return resource.ResourceType === 'AWS::EC2::SpotFleet';

    }).forEach(describeSpotFleetInstance);
}

function describeSpotFleetInstance(resource) {
    console.log(resource.PhysicalResourceId);
    //describe the instances inside the fleet
    var ec2 = new aws.EC2();
    var params = {
        SpotFleetRequestId: resource.PhysicalResourceId
    };
    console.log('params:', resource.PhysicalResourceId);
    ec2.describeSpotFleetInstances(params, createSpotFleetDescriberHandler(ec2));
}

function createSpotFleetDescriberHandler(ec2) {
    return function(err, data) {
        if (err) {
            console.log(err, err.stack);
            return;
        }

        console.log(data.ActiveInstances);

        var params = {
            InstanceIds: [data.ActiveInstances[0].InstanceId]
        };

        ec2.describeInstances(params, function(err, data) {
            if (err) console.log(err, err.stack);
            else {
                console.log('describing instances');
                console.log(data);
                console.log('logging IP address');
                console.log(data.Reservations[0].Instances[0].PublicIpAddress);
            }
        });
    }
}
