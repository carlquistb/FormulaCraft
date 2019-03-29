# FormulaCraft
A SMS-based service for running Minecraft server on AWS.

# ThePlan

**NOTE** that this repo is currently under construction. This is a learning process in which I will dig deeper into a few technologies, and I don't expect it to be complete for a few months.

This implementation will have two high level components. First, a AWS Cloudformation script that implements the SMS-based API for querying the status of servers being run. Second, a Cloudformation script that implements the stack for each server requested. We will work from the bottom up, hoping to develop the stack,  fully automated, first. Before the creation of this repo, significant work was done creating a working stack allowing for MCServer to run.

# Files

## .gitignore
	- .pem, .ppk are both keys used for accessing ec2 instances through SSH on Windows.
	- .txt are almost always my own simple note files. Not necessary for understanding this repo.

## FormulaStack
	- This Cloudformation script will generate the resources needed to run the API that will give and answer calls for Minecraft Servers. This stack should be left up for the duration of the project's use.
## AutoStack
	- This Cloudformation script will create a proprietary stack for each Minecraft Server requested through the API. These stacks will be brought up and down by the API, and will not be generated manually at all, unless for debugging purposes.

# the Stack

	- AWS Cloudformation
	- EC2 userdata for run on startup services
	- Node.js for MCServer wrapper.
	- AWS services including EC2, Lambda, SMS/SQS, etc in API implementation.

# notes

below this section, all of this is just notes for myself.

## resources
	- https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html