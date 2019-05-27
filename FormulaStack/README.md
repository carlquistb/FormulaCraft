

# clientPortal
This, conceptually, is just a way for the administrator to manage the creation, update, and deletion of AutoStacks. This may take many forms such as a terminal based API, a website, a SMS API, etc.
5-9-19 note: due to the fact that you must go to an outside company to handle SMS routing to a APIGateway in AWS (and pay an outside company...) we are first implementing a website version of the clientPortal.

![clientPortal basic web frame](../media/clientPortal.PNG)

## material dashboard v1.2.0

This is a web design template that was purchased from Creative Tim. We will utilize this as a boilerplate structure to build the webPortal.

# mineAPI

  This will be the principal interaction layer between clientPortal and the AutoStacks. This implementation will use APIGateway and Lambda for a serverless approach. We will define a RESTful API below.

  **helpful resources**
- [best practices for RESTful APIs](https://medium.com/@mwaysolutions/10-best-practices-for-better-restful-api-cbe81b06f291)
- [auth and login with Cognito](https://aws.amazon.com/getting-started/projects/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/module-4/)
