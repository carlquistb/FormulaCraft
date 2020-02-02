# FormulaCraft
A Proof of Concept project for running Minecraft servers on AWS.

![the project.](media/FormulaCraftdetailV2.png)

## Project Summary

The public cloud affords on demand compute power. This can be utilized by hosting providers to offer more granular payment options, as you **pay by the hour or by the second**.

This will serve an **under-represented community of casual gamer groups**, who will operate servers for low and sporadic time intervals. Current hosting providers typically offer a monthly subscription, with limited provisions for raising or lowering your capacity; but no hourly or even daily subscription options. This leads to idle servers and wasted resources.


# Built With
- [node.js](https://nodejs.org/en/) - The server backend framework.
- [child_process](https://nodejs.org/api/child_process.html) - The MC Server monitoring used.
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/) - For programmatic resource partitioning.
- [AWS S3 web hosting](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html) - Hosting the Client Portal.
- [Creative Tim](https://www.creative-tim.com/product/material-dashboard-pro-react) - The front-end style framework.
- [AWS Lambda & API Gateway](https://aws.amazon.com/api-gateway/) - The interaction layer API.
- [Cloudcraft](https://cloudcraft.co/) - Visual AWS representations.

# Versioning

- (complete January, 2020) Version 1 is a proof of concept. Minimal client-side functionality or optimizations.
- (March, 2020) Version 2 is a tuning update. Focus will be as follows:
  - Stack partitioning. More efficient resource partitioning.
  - Client Portal redesign. A more intuitive approach allowing for more features in future updates.
  - CI/CD definitions.
- (May, 2020) Version 3 is a features update. Focus will be as follows:
  - User quality of life changes.
  - Mod compatability and availability.
  - distributable software.
- (July, 2020) Version 4 is a marketing update. At this point, the project will likely be sold or monetized.

# Authors

- Brendan Carlquist
- Nathan Lipiarski
- (past contributor) Austin Quach
- (onboarding) Oliver Kou

## AutoStack
- This Cloudformation script will create a proprietary stack for each Minecraft Server requested through the API. These stacks will be brought up and down by the API, and will not be generated manually at all, unless for debugging purposes.
- set up cronjob to automatically upload world over time.
- run mineShell.
- clean up save and close down stack...? (TODO: close down stack automation.)
