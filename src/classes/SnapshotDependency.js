const { SnapshotDependency: DBAccess } = require('../db')

const getObjectFromResult = workspaceName => item =>
  item
    ? new SnapshotDependency(workspaceName, item.parentSnapshotId, item.childSnapshotId, item.rank, item.dependencyId)
    : null

const getObjectFromItem = obj =>
  obj
    ? {
      parentSnapshotId: obj.parentSnapshotId,
      childSnapshotId: obj.childSnapshotId,
      rank: obj.rank,
      dependencyId: obj.dependencyId
    }
    : null

class SnapshotDependency {
  constructor (workspaceName, parentSnapshotId, childSnapshotId, rank, dependencyId) {
    this.workspace = workspaceName
    // relationship info
    this.parentSnapshotId = parentSnapshotId
    this.childSnapshotId = childSnapshotId
    this.rank = rank
    this.dependencyId = dependencyId
  }
}

SnapshotDependency.register = (workspaceName, item) => DBAccess.register(workspaceName, getObjectFromItem(item))
SnapshotDependency.registerMany = (workspaceName, items) => DBAccess.registerMany(workspaceName, items.map(getObjectFromItem))
SnapshotDependency.getAll = (workspaceName) => DBAccess.getAll(workspaceName).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotDependency.getByParentId = (workspaceName, parentSnapshotId) => DBAccess.where(workspaceName, { parentSnapshotId }).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotDependency.getByChildId = (workspaceName, childSnapshotId) => DBAccess.where(workspaceName, { childSnapshotId }).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotDependency.where = (workspaceName, obj) => DBAccess.where(workspaceName, obj).then(results => results.map(getObjectFromResult(workspaceName)))
SnapshotDependency.find = (workspaceName, obj) => DBAccess.find(workspaceName, obj).then(result => getObjectFromResult(workspaceName)(result))
SnapshotDependency.remove = (workspaceName, obj) => DBAccess.remove(workspaceName, obj)
SnapshotDependency.removeOrphaned = (workspaceName) => DBAccess.removeOrphaned(workspaceName)

module.exports = SnapshotDependency
