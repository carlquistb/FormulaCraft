# lambda
	These scripts will be uploaded to AWS lambda and run as serverless code. They will be triggered by async requests in the clientPortal.

## listAutoStacks.js

	node.js 8.10 function that retrieves information on all current stacks.

# clientPortal
	This, conceptually, is just a way for the administrator to manage the creation, update, and deletion of AutoStacks. This may take many forms such as a terminal based API, a website, a SMS API, etc. 
	5-9-19 note: due to the fact that you must go to an outside company to handle SMS routing to a APIGateway in AWS (and pay an outside company...) we are first implementing a website version of the clientPortal.

[clientPortal basic web frame](../media/clientPortal.png)

## material dashboard v1.2.0

	This is a web design template that was purchased from Creative Tim. We will utilize this as a boilerplate structure to build the webPortal.

