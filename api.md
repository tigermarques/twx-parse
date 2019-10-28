## Classes

<dl>
<dt><a href="#Workspace">Workspace</a></dt>
<dd><p>Class that represents a workspace</p>
</dd>
</dl>

## Objects

<dl>
<dt><a href="#twx-parser">twx-parser</a> : <code>object</code></dt>
<dd><p>Entry point for the library</p>
</dd>
</dl>

<a name="Workspace"></a>

## Workspace
Class that represents a workspace

**Kind**: global class  

* [Workspace](#Workspace)
    * [new Workspace(name)](#new_Workspace_new)
    * [.addFile(filePath)](#Workspace+addFile) ⇒ <code>Promise.&lt;(undefined\|Error)&gt;</code>
    * [.removeFile(filePath)](#Workspace+removeFile) ⇒ <code>Promise.&lt;(undefined\|Error)&gt;</code>
    * [.getSnapshots(criteria)](#Workspace+getSnapshots) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
    * [.getSnapshotDependencies(inputData)](#Workspace+getSnapshotDependencies) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
    * [.getSnapshotWhereUsed(inputData)](#Workspace+getSnapshotWhereUsed) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
    * [.getSnapshotObjects(inputData)](#Workspace+getSnapshotObjects) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
    * [.getObjects(objectCriteria, snapshotCriteria)](#Workspace+getObjects) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
    * [.getObjectDependencies(inputData, snapshotCriteria)](#Workspace+getObjectDependencies) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
    * [.getObjectWhereUsed(inputData, snapshotCriteria)](#Workspace+getObjectWhereUsed) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
    * [.getObjectSnapshots(inputData)](#Workspace+getObjectSnapshots) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
    * [.getLeafNodes()](#Workspace+getLeafNodes) ⇒ <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code>
    * [.getTopLevelNodes()](#Workspace+getTopLevelNodes) ⇒ <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code>

<a name="new_Workspace_new"></a>

### new Workspace(name)
Create a workspace.


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The workspace name |

<a name="Workspace+addFile"></a>

### workspace.addFile(filePath) ⇒ <code>Promise.&lt;(undefined\|Error)&gt;</code>
Add a file to the workspace.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(undefined\|Error)&gt;</code> - a `Promise` that will be resolved if the file is successfully parsed and added, or rejected with an `Error` instance if any error occurs.  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | path to the TWX file to be added |

<a name="Workspace+removeFile"></a>

### workspace.removeFile(filePath) ⇒ <code>Promise.&lt;(undefined\|Error)&gt;</code>
Remove a file from the workspace.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(undefined\|Error)&gt;</code> - a `Promise` that will be resolved if the file is successfully parsed and removed, or rejected with an `Error` instance if any error occurs.  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>string</code> | path to the TWX file to be removed |

<a name="Workspace+getSnapshots"></a>

### workspace.getSnapshots(criteria) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
Query snapshots from the workspace.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `AppSnapshot` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| criteria | <code>object</code> | search criteria, that may include the following properties |
| criteria.snapshotId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot IDs |
| criteria.appId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application IDs |
| criteria.branchId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch IDs |
| criteria.snapshotName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot names |
| criteria.branchName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch names |
| criteria.appShortName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application acronyms |
| criteria.appName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application names |
| criteria.isToolkit | <code>string</code> \| <code>Array.&lt;boolean&gt;</code> | use this property to query by toolkits or process applications |

<a name="Workspace+getSnapshotDependencies"></a>

### workspace.getSnapshotDependencies(inputData) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
Retrieve snapshots that are direct children of the snapshot(s) passed as input.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `AppSnapshot` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>AppSnapshot</code> \| <code>Array.&lt;AppSnapshot&gt;</code> | snapshot(s) for which we want to retrieve children |

<a name="Workspace+getSnapshotWhereUsed"></a>

### workspace.getSnapshotWhereUsed(inputData) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
Retrieve snapshots that are direct parents of the snapshot(s) passed as input.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `AppSnapshot` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>AppSnapshot</code> \| <code>Array.&lt;AppSnapshot&gt;</code> | snapshot(s) for which we want to retrieve parents |

<a name="Workspace+getSnapshotObjects"></a>

### workspace.getSnapshotObjects(inputData) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
Retrieve objects that belong to the snapshot(s) passed as input.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `ObjectVersion` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>AppSnapshot</code> \| <code>Array.&lt;AppSnapshot&gt;</code> | snapshot(s) for which we want to retrieve objects |

<a name="Workspace+getObjects"></a>

### workspace.getObjects(objectCriteria, snapshotCriteria) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
Query objects from the workspace. Optionally, you can restrict results that belong to snapshot(s) that match the given criteria.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `ObjectVersion` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| objectCriteria | <code>object</code> | search criteria, that may include the following properties |
| objectCriteria.objectVersionId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more object version IDs |
| objectCriteria.objectId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more object IDs |
| objectCriteria.name | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more object names |
| objectCriteria.type | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more object types |
| objectCriteria.subtype | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more object sub types |
| snapshotCriteria | <code>object</code> | snapshot search criteria to restrict results, that may include the following properties |
| snapshotCriteria.snapshotId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot IDs |
| snapshotCriteria.appId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application IDs |
| snapshotCriteria.branchId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch IDs |
| snapshotCriteria.snapshotName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot names |
| snapshotCriteria.branchName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch names |
| snapshotCriteria.appShortName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application acronyms |
| snapshotCriteria.appName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application names |
| snapshotCriteria.isToolkit | <code>string</code> \| <code>Array.&lt;boolean&gt;</code> | use this property to query by toolkits or process applications |

<a name="Workspace+getObjectDependencies"></a>

### workspace.getObjectDependencies(inputData, snapshotCriteria) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
Retrieve objects that are direct children of the objects(s) passed as input. Optionally, you can restrict results that belong to snapshot(s) that match the given criteria.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `ObjectVersion` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>ObjectVersion</code> \| <code>Array.&lt;ObjectVersion&gt;</code> | object(s) for which we want to retrieve direct children |
| snapshotCriteria | <code>object</code> | snapshot search criteria to restrict results, that may include the following properties |
| snapshotCriteria.snapshotId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot IDs |
| snapshotCriteria.appId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application IDs |
| snapshotCriteria.branchId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch IDs |
| snapshotCriteria.snapshotName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot names |
| snapshotCriteria.branchName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch names |
| snapshotCriteria.appShortName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application acronyms |
| snapshotCriteria.appName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application names |
| snapshotCriteria.isToolkit | <code>string</code> \| <code>Array.&lt;boolean&gt;</code> | use this property to query by toolkits or process applications |

<a name="Workspace+getObjectWhereUsed"></a>

### workspace.getObjectWhereUsed(inputData, snapshotCriteria) ⇒ <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code>
Retrieve objects that are direct parents of the objects(s) passed as input. Optionally, you can restrict results that belong to snapshot(s) that match the given criteria.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;ObjectVersion&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `ObjectVersion` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>ObjectVersion</code> \| <code>Array.&lt;ObjectVersion&gt;</code> | object(s) for which we want to retrieve direct parents |
| snapshotCriteria | <code>object</code> | snapshot search criteria to restrict results, that may include the following properties |
| snapshotCriteria.snapshotId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot IDs |
| snapshotCriteria.appId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application IDs |
| snapshotCriteria.branchId | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch IDs |
| snapshotCriteria.snapshotName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more snapshot names |
| snapshotCriteria.branchName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more branch names |
| snapshotCriteria.appShortName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application acronyms |
| snapshotCriteria.appName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | use this property to query by one or more application names |
| snapshotCriteria.isToolkit | <code>string</code> \| <code>Array.&lt;boolean&gt;</code> | use this property to query by toolkits or process applications |

<a name="Workspace+getObjectSnapshots"></a>

### workspace.getObjectSnapshots(inputData) ⇒ <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code>
Retrieve snapshots whose object(s) passed as input belong to.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;AppSnapshot&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of `AppSnapshot` instances with the results that match the given criteria, or rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| inputData | <code>ObjectVersion</code> \| <code>Array.&lt;ObjectVersion&gt;</code> | object(s) for which we want to retrieve snapshots |

<a name="Workspace+getLeafNodes"></a>

### workspace.getLeafNodes() ⇒ <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code>
Retrieve snapshots that do not depend on any other snapshots.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of results that match the given criteria, or rejected with an `Error` instance if any error occurs. The result has a `getNextLevel` method to retrieve the next level on the dependency tree.  
<a name="Workspace+getTopLevelNodes"></a>

### workspace.getTopLevelNodes() ⇒ <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code>
Retrieve snapshots that are not a dependency to any other snapshots.

**Kind**: instance method of [<code>Workspace</code>](#Workspace)  
**Returns**: <code>Promise.&lt;(Array.&lt;object&gt;\|Error)&gt;</code> - a `Promise` that will be resolved with an array of results that match the given criteria, or rejected with an `Error` instance if any error occurs. The result has a `getNextLevel` method to retrieve the next level on the dependency tree.  
<a name="twx-parser"></a>

## twx-parser : <code>object</code>
Entry point for the library

**Kind**: global namespace  
<a name="twx-parser.getWorkspace"></a>

### twx-parser.getWorkspace(name, password) ⇒ <code>Promise.&lt;(Workspace\|Error)&gt;</code>
Method to get or create a workspace

**Kind**: static method of [<code>twx-parser</code>](#twx-parser)  
**Returns**: <code>Promise.&lt;(Workspace\|Error)&gt;</code> - Promise that will be resolved with a `Workspace` instance, or be rejected with an `Error` instance if any error occurs  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the workspace. If a workspace with this name already exists, it is retrieved. Otherwise, a new workspace is created. |
| password | <code>string</code> | Password to open the workspace. If the workspace is new, the given password will be the workspace's password. If the workspace already exists, this password will be compared with the password used to create the workspace |

