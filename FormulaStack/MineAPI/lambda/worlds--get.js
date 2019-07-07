/*
Develop date: 5/29
Description: returns a list of worlds avilable on the FormulaCraft instance.
paramenters:
    Query line parameters:
      limit: Maximum number of world objects to return.
      start: Where to start returning.
      example- limit=5 returns objects 0 - 4
      example- limit=5&start=10 returns objects 10 - 14

output: (limit=5&start=10)
    200: success.
        body: {
          size: 5,
          start: 5,
          previous: "limit=5&start=5",
          next: "limit=5&start=15",
          lastEvaluatedKey : object
          items: [
            {
              worldID,
              flavorID,
              s3Filepath,
              worldName
            },
            {...},
            {...},
            {...},
            {...}
          ]
        }
    400: bad request. pagination issue or bad query form. TODO: implement.
*/

exports.handler = (event, context, callback) => {

    const aws = require('aws-sdk');

    var DocClient = new aws.DynamoDB.DocumentClient();

    //TODO: verify parameters were received correctly.

    //If no limit was received, set the limit to 5 as default.
    if(event.queryStringParameters.limit == null) {
      event.queryStringParameters.limit = 5;
    }

    //query worlds table for data.

    var params = {
        TableName:"worlds",
        ProjectionExpression: "worldID, flavorID, s3Filepath, worldName",
        Limit:event.queryStringParameters.limit
        //FilterExpression parameter introduces filtering results by any column
    };

    console.log("scanning \"worlds\" table");
    DocClient.scan(params, function(err, data) {
      if(err) {
        console.log(err,err.stack);

        //define and return response

        var response = {
            isBase64Encoded: true,
            statusCode: 400,
            headers: {
            "x-custom-header" : "my custom header value"
            },
            body: JSON.stringify({})
        };

        callback(err, response);
      }
      else { //successful scan
        console.log(data);

        //define and return HTTP response

        var body = {};


        // the following code needs to be finished to implement the next and previous values.
        /*
          //is this the first result set? define previous attribute.
          if(!event.queryStringParameters.start > 0) {
            let previousStart = event.queryStringParameters.start - event.queryStringParameters.limit;
            event.previous = "limit="
                            + event.queryStringParameters.limit;
            if(previousStart > 0) event.previous += "&start=" + previousStart;
          }

          //TODO: how do we decide if there are more to send, and if there will be a "next" parameter?
        */

        body.lastEvaluatedKey = data.lastEvaluatedKey;

        body.items = data.Items;

        const response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {
            "x-custom-header" : "my custom header value"
            },
            body: JSON.stringify(body)
        };

        callback(null, response);
      }
    });




};
