const { SnapshotObjectDependency: DBAccess } = require('../db')

const getObjectFromResult = workspaceName => item =>
  item
    ? new SnapshotObjectDependency(workspaceName, item.snapshotId, item.objectVersionId, item.objectId)
    : null

const getObjectFromItem = obj =>
  obj
    ? {
      snapshotId: obj.snapshotId,
      objectVersionId: obj.objectVersionId,
      objectId: obj.objectId
    }
    : null

class SnapshotObjectDependency {
  constructor (workspaceName, snapshotId, objectVersionId, objectId) {
    this.workspace = workspaceName
    // relationship info
    this.objectVersionId = objectVersionId
    this.snapshotId = snapshotId
    this.objectId = objectId
  }
}

SnapshotObjectDependency.register = (workspaceName, item) => DBAccess.register(workspaceName, getObjectFromItem(item))
SnapshotObjectDependency.registerMany = (workspaceName, items) => DBAccess.registerMany(workspaceName, items.map(getObjectFromItem))
SnapshotObjectDependency.getAll = (workspaceName) => DBAccess.getAll(workspaceName).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotObjectDependency.getByParentId = (workspaceName, snapshotId) => DBAccess.where(workspaceName, { snapshotId }).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotObjectDependency.getByChildId = (workspaceName, objectVersionId) => DBAccess.where(workspaceName, { objectVersionId }).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotObjectDependency.where = (workspaceName, obj) => DBAccess.where(workspaceName, obj).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotObjectDependency.find = (workspaceName, obj) => DBAccess.find(workspaceName, obj).then(result => getObjectFromResult(workspaceName)(result))
SnapshotObjectDependency.remove = (workspaceName, obj) => DBAccess.remove(workspaceName, obj)
SnapshotObjectDependency.removeOrphaned = (workspaceName) => DBAccess.removeOrphaned(workspaceName)

module.exports = SnapshotObjectDependency
