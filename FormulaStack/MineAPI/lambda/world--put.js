/*
Develop date: 5/29
Description: creates a world file folder as well as a world entry in the "worlds" DynamoDB table.
paramenters:
    Query line parameters:
      worldName: String. Name of the world to create.
      flavorID: ID of the flavor the world will be loaded with.
output:
    200: success. World created. Returns an object of the world created:
        {
            worldID:ASCII
            worldName: String
        }
    400: bad request. Name must be unique. TODO: implement.
*/

exports.handler = (event, context, callback) => {

    const aws = require('aws-sdk');

    var Dynamo = new aws.DynamoDB();

    //TODO: Check if the received flavorID is real.

    //create a unique ID for the requested world.

    const crypto = require('crypto');

    var id = crypto.randomBytes(16).toString("hex");

    console.log("generated ID: ",id);

    //enter world into "worlds" DynamoDB table.

    var params = {
        TableName:"worlds",
        ReturnConsumedCapacity: "NONE",
        Item:{
            flavorID: {
                S: event.queryStringParameters.flavorID
              },
              s3Filepath: {
                //TODO: this will eventually be replaced by variable fetches, I hope.
                S: "s3://bc-minecraft-repo/worlds/" + event.queryStringParameters.worldName
              },
              worldID: {
                S: id
              },
              worldName: {
                S: event.queryStringParameters.worldName
              }
        }
    };

    Dynamo.putItem(params, function(err, data) {
      if(err) {
        console.log(err,err.stack);

        //define and return HTTP response

        var response = {
            isBase64Encoded: true,
            statusCode: 400,
            headers: {},
            body: JSON.stringify({})
        };

        callback(err, response);
      }
      else {
        console.log(data);

        //define and return HTTP response

        var body = {};

        body.id = id;

        body.worldName=event.queryStringParameters.worldName;

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
