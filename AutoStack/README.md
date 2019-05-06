# AutoStack

## Resources

### FormulaStack.yaml
	- This Cloudformation script will generate the resources needed to run the API that will give and answer calls for Minecraft Servers. This stack should be left up for the duration of the project's use.

### mineShell.js
	- This script is responsible for managing the server.jar as a child process. 
	- user-initiated world save and exit
	- automated world save (not upload- this will be a cronjob set up in AutoStack.)

### cronjob
	- this is a executable that will be installed by the EC2 userdata, and will be responsible for upload to s3 periodically.

