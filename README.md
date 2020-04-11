# PostGraphile and now.sh

Large chunks of this were taken from https://github.com/graphile/postgraphile-lambda-example

This demo runs PostGraphile as a lambda using now.sh infrastructure
To run this locally, edit the `.env` file to point to a local postgres database.

* run `node shared/makeCache.js` to generate the cache of the graphql schema for PostGraphile.  Note that this is a code change that you'll probably want to commit.
 
 * run `now dev`.  A short while later you'll get a message sayign that the server is running and you'll be able to open http://localhost:3000 and see GraphiQl running in the browser

To connect to an AWS RDS postgres, you'll want to test it locally first.

I create an `.env.aws-dev` file that looks something like this:

```
DATABASE_HOST=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_PORT=5432
DATABASE_SSL=1
DATABASE_SSL_CERT=../shared/rds-combined-ca-bundle.pem
``` 

Fill in the obvious entries.  Note the SSL_CERT value.  Since the same environment variable is used both by he script that generates the schema as well as the lambda to connect to the database, there are some (awkward) assumptions about how the path is calculated.  Leave it like this and both work.

Then I copy those values over to .env and run `now dev` locally to ensure that I've got everything configured and working correctly.
 
If that works correctly, I run `./secrets.sh` which dumps those secrets from `.env.aws-dev` into the projects now secrets.

Then run now and follow the prompts.

A while later you should see a new deployment.

