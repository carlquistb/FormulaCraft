
/*

name: listAutoStacks

use: clientPortal

description: provides information about AutoStacks. Includes name.

requirements: ServiceRole with read/list permissions in order to access the AWS CFN API. Sometimes requires a timeout of over 5 seconds.

toDo:
  include numPlayers
  include uptime and status
  include stack parameters such as world and flavor

*/

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log('entered exports.handler');

    const aws = require('aws-sdk');
    const cfn = new aws.CloudFormation();

    let params = {
        StackStatusFilter: ['CREATE_COMPLETE']
    };
    console.log('created params');
    cfn.listStacks(params, (err, data) => {
        if (err) {
            console.log('DescribeStacks call failed. \n', err);
        } else {
            //console.log();('successfully reached callback for listStacks');
            console.log(data.StackSummaries);
        }
    });
};

/*

AWS supplied response code. Not fully understood and most likely not implemented.

const https = require('https');
const url = require('url');


// Sends a response to the pre-signed S3 URL
function sendResponse(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);

    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        },
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
}
*/
