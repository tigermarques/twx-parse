const { ObjectDependency: DBAccess } = require('../db')

const getObjectFromResult = workspaceName => item =>
  item
    ? new ObjectDependency(workspaceName, item.parentObjectVersionId, item.childObjectVersionId, item.dependencyType, item.dependencyName)
    : null

const getObjectFromItem = obj =>
  obj
    ? {
      parentObjectVersionId: obj.parentObjectVersionId,
      childObjectVersionId: obj.childObjectVersionId,
      dependencyType: obj.dependencyType,
      dependencyName: obj.dependencyName
    }
    : null

class ObjectDependency {
  constructor (workspaceName, parentObjectVersionId, childObjectVersionId, dependencyType, dependencyName) {
    this.workspace = workspaceName
    // relationship info
    this.parentObjectVersionId = parentObjectVersionId
    this.childObjectVersionId = childObjectVersionId
    this.dependencyType = dependencyType
    this.dependencyName = dependencyName
  }
}

ObjectDependency.register = (workspaceName, item) => DBAccess.register(workspaceName, getObjectFromItem(item))
ObjectDependency.registerMany = (workspaceName, items) => DBAccess.registerMany(workspaceName, items.map(getObjectFromItem))
ObjectDependency.getAll = (workspaceName) => DBAccess.getAll(workspaceName).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.getByParentId = (workspaceName, parentObjectVersionId) => DBAccess.where(workspaceName, { parentObjectVersionId }).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.getByChildId = (workspaceName, childObjectVersionId) => DBAccess.where(workspaceName, { childObjectVersionId }).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.where = (workspaceName, obj) => DBAccess.where(workspaceName, obj).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.find = (workspaceName, obj) => DBAccess.find(workspaceName, obj).then(result => getObjectFromResult(workspaceName)(result))
ObjectDependency.remove = (workspaceName, obj) => DBAccess.remove(workspaceName, obj)
ObjectDependency.removeOrphaned = (workspaceName) => DBAccess.removeOrphaned(workspaceName)

module.exports = ObjectDependency
