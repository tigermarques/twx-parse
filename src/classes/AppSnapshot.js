const { AppSnapshot: DBAccess } = require('../db')
// const SnapshotDependency = require('./SnapshotDependency')

const getObjectFromResult = workspaceName => item =>
  item
    ? new AppSnapshot(workspaceName, item.snapshotId, item.appId, item.branchId, item.appShortName, item.snapshotName, item.appName, item.branchName, item.isToolkit === 1,
      item.isObjectsProcessed === 1)
    : null

class AppSnapshot {
  constructor (workspaceName, id, appId, branchId, appShortName, snapshotName, appName, branchName, isToolkit, isObjectsProcessed) {
    this.workspace = workspaceName
    // primary key
    this.snapshotId = id

    // basic info
    this.appId = appId
    this.branchId = branchId
    this.snapshotName = snapshotName
    this.branchName = branchName
    this.appShortName = appShortName
    this.appName = appName
    this.isToolkit = isToolkit
    this.isObjectsProcessed = isObjectsProcessed
  }
}

AppSnapshot.register = (workspaceName, item) => DBAccess.register(workspaceName, item)
AppSnapshot.markObjectsProcessed = (workspaceName, snapshotId) => DBAccess.update(workspaceName, snapshotId, { isObjectsProcessed: 1 })
AppSnapshot.getAll = (workspaceName) => DBAccess.getAll(workspaceName).then(results => results.map(getObjectFromResult(workspaceName)))
AppSnapshot.getById = (workspaceName, snapshotId) => DBAccess.getById(workspaceName, snapshotId).then(result => getObjectFromResult(workspaceName)(result))
AppSnapshot.where = (workspaceName, obj) => DBAccess.where(workspaceName, obj).then(results => results.map(getObjectFromResult(workspaceName)))
AppSnapshot.find = (workspaceName, obj) => DBAccess.find(workspaceName, obj).then(result => getObjectFromResult(workspaceName)(result))
AppSnapshot.remove = (workspaceName, obj) => DBAccess.remove(workspaceName, obj)
AppSnapshot.removeOrphaned = (workspaceName) => DBAccess.removeOrphaned(workspaceName)

module.exports = AppSnapshot
