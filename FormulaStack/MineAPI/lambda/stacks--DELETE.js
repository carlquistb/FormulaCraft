/*
Develop date: 1/25

Description: lambda function used to delete a Cloudformation stack.

dependencies:
	IAM role fn--stacks--delete

Meant for use in mineAPI, /stacks/DELETE method.

parameters:
	stackName: the ARN of the stack you want to delete.

output:
	??

*/

exports.handler = (event, context, callback) => {

	const aws = require('aws-sdk');

	const cfn = new aws.CloudFormation();

	let params = {
		StackName: event.queryStringParameters.stackName
		//RetainResources - resource ARNs you want to keep. This is none for our purpose.
		//RoleARN - ARN of the role cloudformation will assume to delete the resources of the stack. Default = role previously assumed.
	};

	cfn.deleteStack(params, function(err, data) {
		if (err) { // an error occurred
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
		else  { // successful response
			console.log(data);
			console.log(params);

			//define and return HTTP response

			let body = data;
			body.stackName = event.queryStringParameters.stackName;

			const response = {
					isBase64Encoded: true,
					statusCode: 202, //use 202 for queued, 200 for success
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
