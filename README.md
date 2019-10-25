[![Build Status](https://travis-ci.org/tigermarques/twx-parse.svg?branch=master)](https://travis-ci.org/tigermarques/twx-parse)
[![codecov](https://codecov.io/gh/tigermarques/twx-parse/branch/master/graph/badge.svg)](https://codecov.io/gh/tigermarques/twx-parse)
![npm](https://img.shields.io/npm/v/twx-parser?color=green&label=npm%20package)

# twx-parse
twx-parse is a library for parsing and querying TWX files for IBM BPM.

## Motivation
Analyzing IBM BPM Process Applications and Toolkits is not easy when dealing with complex analysis. For example, if you have a toolkit shared by 3 applications, it is challenging to know which toolkit assets each application is actually using. This lack of visibility makes the change management process difficult and time consuming.

This tool aims to parse multiple TWX files and build a data structure that allows to easily discover dependencies, and also allows to easily query these applications and toolkits.

## Getting Started

### Installing

Use `npm` or `yarn` to install this library

```
npm install twx-parse

yarn install twx-parse
```

### Quick Examples

To get started using the library you can use the only public method provided:

```javascript
const twxParse = require('twx-parse')

...

// retrieve the workspace providing credentials. if the workspace does not
// exist, a new one will be created
const workspace = await twxParse.getWorkspace(workspaceName, password)

// add a new file to be processed
await workspace.addFile(filePath)

// retrieve all the snapshots (applications or toolkits)
const snapshots = await workspace.getSnapshots()
console.log(snapshots)
/* Output:
[{
  workspace: 'name1',
  snapshotId: '2064.1080ded6-d153-4654-947c-2d16fce170ed',
  appId: '2066.1b351583-e5cb-43b7-baee-340a63130ea7',
  branchId: '2063.0798815e-0346-4ef4-8946-ab4301c9f340',
  appShortName: '8.6.0.0',
  snapshotName: 'System Data',
  appName: 'TWSYS',
  branchName: 'Main',
  isToolkit: true,
  isObjectsProcessed: true
}, {
  workspace: 'name1',
  snapshotId: '2064.c7680890-5385-3f24-bbc9-20da937ac8c4',
  appId: '2066.aa12f1cb-4661-3bd0-a351-45649d179885',
  branchId: '2063.7e0d6e21-f74c-3542-9f77-1472b63c22f1',
  appShortName: 'SYSRC',
  snapshotName: '8.6.0.0',
  appName: 'Responsive Coaches',
  branchName: 'Main',
  isToolkit: true,
  isObjectsProcessed: true
},
...
]
*/

// retrieve all the objects (present in both applications or toolkits)
const objects = await workspace.getObjects()
console.log(objects)
/* Output:
[{
  workspace: 'name1',
  objectVersionId: 'bbe4cee0-85f5-3955-b9c8-7ebdc9e2d8f3',
  objectId: '1.c2d00e9e-9c34-3e08-9258-101bd61b964d',
  name: 'Default Responsive Human Service',
  type: '1',
  subtype: '10'
}, {
  workspace: 'name1',
  objectVersionId: '68222369-2914-4824-afa4-71bb4bdcbce7',
  objectId: '12.d8fa7561-8636-40a9-bd70-f45128bb7e54',
  name: 'BPMBOSaveFailedError',
  type: '12',
  subtype: null
},
...
]
*/
```

## API

#### twx-parser

* `getWorkspace(workspaceName, password): Promise<workspace>`
  * `workspaceName` - Name of the workspace. If a workspace with this name already exists, it is retrieved. Otherwise, a new workspace is created.
  * `password` - Password to open the workspace. If the workspace is new, the given password will be the workspace's password. If the workspace already exists, this password will be compared with the password used to create the workspace
  * returns a `Promise` that will resolve to a `Workspace` instance, or be rejected with an `Error` instance if any error occurs

#### Workspace

* `addFile(filePath)`
  * `filePath` - path to the TWX file to be added
  * returns a `Promise` that will resolve if the file is successfully parsed and added, or rejected with an `Error` instance if any error occurs

* `removeFile(filePath)`
  * `filePath` - path to the TWX file to be removed
  * returns a `Promise` that will be resolved if the file is successfully parsed and removed, or rejected with an `Error` instance if any error occurs

* `getSnapshots(criteria)`
  * `criteria` - search criteria, that may include the following properties: `snapshotId`, `appId`, `branchId`, `snapshotName`, `branchName`, `appShortName`, `appName`, `isToolkit`
  * returns a `Promise` that will be resolved with an array of `AppSnapshot` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs

* `getSnapshotDependencies(inputData)`
* `getSnapshotWhereUsed(inputData)`
* `getSnapshotObjects(inputData)`
* `getObjects(objectCriteria, snapshotCriteria)`
* `getObjectDependencies(inputData, snapshotCriteria)`
* `getObjectWhereUsed(inputData, snapshotCriteria)`
* `getObjectSnapshots(inputData)`
* `getLeafNodes()`
* `getTopLevelNodes()`

## Developing

PR as welcome to this project. If you have a new feature that you would like to see in the library, please open an issue for discussion before the PR.

### Running Tests

To run the full test suite, simply run

```
npm test
```

To check for code style, run

```
npm run lint
```

### Versioning

This project follows the [Semantic Versioning 2.0.0](https://semver.org/) guide. Version numbering is handled by the package `semantic-release`. Therefore, never update the `version` field in the `package.json` file.

### Commit Messages

This project follows the [Angular Commit Message Guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits). To help creating compliant commit messages, please use the `npm run commit` command and follow the instructions.

## Roadmap

To be defined...

## Licence

The code in this project is licensed under MIT license.
