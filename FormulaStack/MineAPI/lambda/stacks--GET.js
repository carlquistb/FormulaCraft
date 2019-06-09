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
        StackStatusFilter: ['CREATE_COMPLETE','CREATE_IN_PROGRESS','DELETE_IN_PROGRESS']
    };

    console.log('querying current stacks');
    cfn.listStacks(params, function(err, data) {
      if(err) {
        console.log(err,err.stack);

        //define and return response

        var response = {
            isBase64Encoded: true,
            statusCode: 400,
            headers: {},
            body: JSON.stringify({})
        };

        callback(err, response);
      }
      else { //method success callback fn
        console.log(data.StackSummaries);

        //define and return HTTP response

        var body = data.StackSummaries;

        const response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {},
            body: JSON.stringify(body)
        };

        callback(null, response);
      }
    });




};
