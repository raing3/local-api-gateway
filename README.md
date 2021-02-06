# Local API Gateway [![npm-version](https://img.shields.io/npm/v/@local-api-gateway/cli.svg)](https://www.npmjs.com/package/@local-api-gateway/cli)
This tool simplifies the process of exposing multiple separate Docker based HTTP APIs through a single gateway. This tool aims to take care of:

Exactly what does this tool do:
 * Clones and builds the repositories you configure.
 * Merges the Dockerfile/docker-compose.yml files across your repositories into a single docker-compose.yml file.
 * Creates a gateway container accessible via HTTP which can route traffic based on paths to your other containers.
 * Provides facilities for adding middleware to modify the request/response.

As part of the merge process the following changes are made to the input `docker-compose.yml` files:
 * `services` in each of the `docker-compose.yml` files are renamed to avoid conflicts between each of the repositories.
 * Mounted volumes are updated to be relative to the merged `docker-compose.yml` location.
 * `links` are updated to reference the new service names in the merged config.
 * All host port mappings are removed to avoid conflicts.

## Prerequisites
Before installing this tool you need to install:
 * Node 10+
 * NPM 6+
 * Docker 19+
 * Docker Compose 1.25.5+
 * Git CLI

## Installation
`npm install -g @local-api-gateway/cli`

## Upgrading
```
# upgrade the cli tool
npm install -g @local-api-gateway/cli

# rebuild the gateway container (run in the directory of the local-api-gateway.yml file)
local-api-gateway build
```

## Usage
### Command line
`local-api-gateway [options] [command]`

The CLI tool acts as a proxy to the `docker-compose` CLI. Any command and arguments supported by `docker-compose` can be used:
https://docs.docker.com/compose/reference/overview/

The tool should be executed in a directory which contains a `local-api-gateway.yml` file, refer to the
[Configuration file format](#configuration-file-format) section for more information.

##### up
`$ local-api-gateway up`
 * Checks out and builds the integrations specified in `local-api-gateway.yml` then runs `docker-compose up`.

##### build
`$ local-api-gateway build`
 * Checks out and builds the integrations specified in `local-api-gateway.yml` then runs `docker-compose build`.

##### ssh
`$ local-api-gateway ssh [integration name]`
 * SSH into the integration specified.

## Configuration file format

```
name: my-gateway-name # the name of the gateway

gateway:
  host: 127.0.0.1 # interface to bind the gateway container on.
  port: 8080 # port to bind the gateway container on.

middleware:
  cors:
    # cors middleware options, accepted options are documented here:
    # https://expressjs.com/en/resources/middleware/cors.html#configuration-options.
  traceId:
    header: "Trace-Id" # the name to use for the trace ID header, default: X-Trace-Id.
  myMiddleware:
    # additional custom middleware files can also be used, the path is relative to the working directory.
    # the middleware is attached to all paths and applied before routing to the integration.
    # more information: https://expressjs.com/en/guide/using-middleware.html
    path: "./middleware/my-middleware.js"

integrations:
  dockerComposeIntegration:
    type: docker-compose # identifies that this is a docker-compose based integration.
    source: # used to identify where the integration should be pulled from during initial setup.
      type: vcs
      url: git@github.com:my-org/example-api.git
    destination: ../example-api # path to checkout source to, relative to the working directory.
    build: "build.sh" # build command to run on initial checkout, executed in destination directory, can be specified as an array of strings for multiple commands.
    context: containers # path to folder containing the docker-compose.yml file, relative to the destination directory.
    routes:
     - service: "nginx" # name of the service in the docker-compose.yml to route the traffic to, default: first service.
       port: 80 # port on the integration container to route traffic to.
       paths:
        # array of paths on the gateway to route to this integration.
        - "/example"
        - "/example/*"

  dockerIntegration:
    type: docker # identifies that this is a docker based integration.
    source: # used to identify where the integration should be pulled from during initial setup.
      type: vcs
      url: git@github.com:my-org/example2-api.git
    destination: ../example2-api # path to checkout source to, relative to the working directory.
    build: "build.sh" # build command to run on initial checkout, executed in destination directory, can be specified as an array of strings for multiple commands.
    context: docker # path to folder containing the docker-compose.yml file, relative to the destination directory.
    routes:
     - port: 80 # port on the integration container to route traffic to.
       paths:
        # array of paths on the gateway to route to this integration.
        - "/example2"
        - "/example2/*"
```

## FAQ

**What is the `.local-api-gateway` folder?**

This folder is maintained by the CLI tool. It is used as a build directory for holding the merged docker-compose.yml
and related files.

This folder is shared inside of the gateway container and should not be manually modified.

**Why aren't the changes I've made to `local-api-gateway.yml`, `docker-compose.yml` or middleware files being
reflected by the gateway?**

After making changes to the gateway configuration you need to stop the gateway and re-run the `up` command.
