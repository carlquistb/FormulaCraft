/*
Develop date: 6/9

Description: First version of function to create a stack. For use with Autostack.yaml version 1.

parameters:
  stackName: A distinct name for the stack you want to create.
  flavorS3Filepath: file path of the flavor you request to be ran.
  worldS3Filepath: file path of the world you request to be ran.
  instanceType: (String) instance type you request to be ran.
output:

*/

exports.handler = (event, context, callback) => {

    const ROLE_ARN = "arn:aws:iam::376177114739:role/CloudformationRole";
    const TEMPLATE_URL = "https://bc-minecraft-repo.s3-us-west-2.amazonaws.com/cloudformation-templates/InstanceStack.yaml";
    const NETWORK_STACK_NAME = "network-stack";
    const KEY_PAIR = "mc-test";

    const aws = require('aws-sdk');

    const cfn = new aws.CloudFormation();

    let params = {
      //Capabilities: allows stack to create IAM resources
      Capabilities:['CAPABILITY_NAMED_IAM'],
      StackName:event.queryStringParameters.stackName,
      //RoleARN: the ARN of the IAM role that will allow CloudFormation to create resources.
      RoleARN:ROLE_ARN, //TODO: This should be a final variable
      TemplateURL:TEMPLATE_URL,
      Parameters:[
        {
          ParameterKey: "MyFlavor",
          ParameterValue: event.queryStringParameters.flavorS3Filepath
        },
        {
          ParameterKey: "MyWorld",
          ParameterValue: event.queryStringParameters.worldS3Filepath
        },
        {
          ParameterKey: "MyKeyPair",
          ParameterValue: KEY_PAIR
        },
        {
          ParameterKey: "MyInstanceType",
          ParameterValue: event.queryStringParameters.instanceType
        },
        {
          ParameterKey: "NetworkStackName",
          ParameterValue: NETWORK_STACK_NAME
        }
      ],
      Tags: [
        {
          Key: "workload",
          Value: "Production"
        },
        {
          Key: "network stack name",
          Value: NETWORK_STACK_NAME
        }
      ]
    };

    console.log('executing CreateStack');
    cfn.createStack(params, function(err, data) {
      if(err) {
        console.log(err,err.stack);
        console.log(params);

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
      }
      else { //method success callback fn
        console.log(data);
        console.log(params);

        //define and return HTTP response

        let body = data;
        body.stackName = event.queryStringParameters.stackName;

        const response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {
              "x-custom-header" : "my custom header value",
              'Access-Control-Allow-Origin':'*',
              "Content-Type" : "application/json"
            },
            body: JSON.stringify(body)
        };

        callback(null, response);
      }
    });




};
