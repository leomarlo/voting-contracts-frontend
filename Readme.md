# Configurable Voting Contracts - Frontend

In this repository you'll find a react app that exposes several features of the configurable voting contracts. First and foremost there is a playground where people may
explore how to use voting contracts in an actual scenario. There is also an interface for people to create their own voting contracts.

## Developers

The project can be build through webpack, which transpiles the react scripts and various style files and images into a single page output. The folder structure is as follows:

```
|
|--- dist
|   |- index.html
|   |--- assets
|   |   |- bundle.js
|--- node_modules
|--- public
|   |--- templates
|   |   |- index.html
|--- src
|   |--- abis
|   |--- components
|   |--- deployment
|   |   |- deploymentInfo.json
|   |--- img
|   |--- styles
|   |--- types
|   |--- utils
|   |- Dapp.tsx
|   |- index.tsx
|- .env
|- .gitignore
|- .package.json
|- .prettierrc
|- webpack.config.js
|- tsconfig.json
|- yarn.lock
```

To build the project please use the following scripts:
```
$ yarn build
$ yarn build:watch
```
If you would like to have a development enviroment set the environment variable `NODE_ENV` inside of *.env* to `development` and otherwise to `production`. Use the `build:watch` option, to continuously update the build, depending on changes in the code base.

To serve the project use:
```
$ yarn serve
```

If you have questions, please do not hesitate to get in contact: *leomarlo.eth@gmail.com*
If you would like to join, or create a pull-request, I am more than happy to review it.
