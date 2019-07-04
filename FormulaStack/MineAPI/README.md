# mineAPI

  This will be the principal interaction layer between clientPortal and the AutoStacks. This implementation will use APIGateway and Lambda for a serverless approach. We will define a RESTful API below.

### APIGateway

  This AWS service will handle the network administration for the API. Through APIGateway, we will define endpoints and map those endpoints to code that runs in AWS Lambda, explained below. API Gateway will handle the HTTP lifecycle, isolating our code from the implementation of REST in general.

### lambda

  This AWS service will handle the code supporting each API endpoint defined in APIGateway. Each lambda function will handle a single endpoint. This serverless structure helps to isolate our code from the implementation of servers, permissions, etc.

### IAM

  In IAM, each Lambda function will require a separate IAM role. These roles will grant access to specific DynamoDB tables, aws-sdk methods, etc. By default, each role will need basic Lambda execution as well as cloudwatch log access.

### Cloudwatch

  This AWS service houses log output from any serverless AWS services, in our case, Lambda and APIGateway. Each lambda function will have it's own "log" to output to.

# Files

- Within the lambda folder, you will find the code of each of our lambda functions, as well as the setup details for each.
- Within the Documentation folder, you will find documentation regarding each API endpoint.

# helpful resources
- [best practices for RESTful APIs](https://medium.com/@mwaysolutions/10-best-practices-for-better-restful-api-cbe81b06f291)
- [auth and login with Cognito](https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/module-4/)
- [Documenting RESTful APIs](https://idratherbewriting.com/learnapidoc/docendpoints.html)
