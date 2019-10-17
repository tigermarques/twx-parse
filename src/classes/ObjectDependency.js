const { ObjectDependency: DBAccess } = require('../db')

const getObjectFromResult = workspaceName => item =>
  item
    ? new ObjectDependency(workspaceName, item.parentObjectVersionId, item.childObjectVersionId)
    : null

class ObjectDependency {
  constructor (workspaceName, parentObjectVersionId, childObjectVersionId) {
    this.workspace = workspaceName
    // relationship info
    this.parentObjectVersionId = parentObjectVersionId
    this.childObjectVersionId = childObjectVersionId
  }
}

ObjectDependency.register = (workspaceName, item) => DBAccess.register(workspaceName, item)
ObjectDependency.registerMany = (workspaceName, items) => DBAccess.registerMany(workspaceName, items)
ObjectDependency.getAll = (workspaceName) => DBAccess.getAll(workspaceName).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.getByParentId = (workspaceName, parentObjectVersionId) => DBAccess.where(workspaceName, { parentObjectVersionId }).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.getByChildId = (workspaceName, childObjectVersionId) => DBAccess.where(workspaceName, { childObjectVersionId }).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.where = (workspaceName, obj) => DBAccess.where(workspaceName, obj).then(results => results.map(getObjectFromResult(workspaceName)))
ObjectDependency.find = (workspaceName, obj) => DBAccess.find(workspaceName, obj).then(result => getObjectFromResult(workspaceName)(result))
ObjectDependency.remove = (workspaceName, obj) => DBAccess.remove(workspaceName, obj)
ObjectDependency.removeOrphaned = (workspaceName) => DBAccess.removeOrphaned(workspaceName)

module.exports = ObjectDependency
