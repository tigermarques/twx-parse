const EventEmitter = require('events')
const Parser = require('../parser')
const Registry = require('./Registry')

const getWithoutChildren = async (name, level, exclusions) => {
  const snapshots = await Registry.AppSnapshot.getWithoutChildren(name, exclusions)
  const snapshotIds = snapshots.map(item => item.snapshotId)
  const dependencies = await Registry.SnapshotDependency.getByChildId(name, snapshotIds)
  const parentIds = dependencies.map(item => item.parentSnapshotId)
  const parentSnapshots = await Registry.AppSnapshot.where(name, { snapshotId: parentIds })
  const newExclusions = exclusions.concat(snapshotIds)
  return {
    items: snapshots.map(snapshot => {
      return {
        snapshot,
        parents: parentSnapshots.filter(parent =>
          dependencies.filter(dependency => dependency.childSnapshotId === snapshot.snapshotId && dependency.parentSnapshotId === parent.snapshotId).length > 0
        )
      }
    }),
    level: level,
    getNextLevel: () => getWithoutChildren(name, level + 1, newExclusions)
  }
}

const getWithoutParents = async (name, level, exclusions) => {
  const snapshots = await Registry.AppSnapshot.getWithoutParents(name, exclusions)
  const snapshotIds = snapshots.map(item => item.snapshotId)
  const dependencies = await Registry.SnapshotDependency.getByParentId(name, snapshotIds)
  const childIds = dependencies.map(item => item.childSnapshotId)
  const childSnapshots = await Registry.AppSnapshot.where(name, { snapshotId: childIds })
  const newExclusions = exclusions.concat(snapshotIds)
  return {
    items: snapshots.map(snapshot => {
      return {
        snapshot,
        children: childSnapshots.filter(child =>
          dependencies.filter(dependency => dependency.parentSnapshotId === snapshot.snapshotId && dependency.childSnapshotId === child.snapshotId).length > 0
        )
      }
    }),
    level: level,
    getNextLevel: () => getWithoutParents(name, level + 1, newExclusions)
  }
}

class Workspace extends EventEmitter {
  constructor (name) {
    super()
    this.name = name
    this.parser = new Parser(this.name)

    const events = ['packageStart', 'packageProgress', 'packageEnd', 'objectStart', 'objectProgress', 'objectEnd']
    events.map(event => {
      this.parser.on(event, data => {
        this.emit(event, data)
      })
    })
  }

  async addFile (filePath) {
    await this.parser.addFile(filePath)
  }

  async removeFile (filePath) {
    await this.parser.removeFile(filePath)
  }

  async getSnapshots (criteria) {
    return Registry.AppSnapshot.where(this.name, criteria)
  }

  async getSnapshotDependencies (inputData) {
    const snapshotId = Array.isArray(inputData) ? inputData.map(snap => snap.snapshotId) : inputData.snapshotId
    return Registry.SnapshotDependency.getByParentId(this.name, snapshotId).then(dependencies =>
      Registry.AppSnapshot.where(this.name, { snapshotId: dependencies.map(dependency => dependency.childSnapshotId) }).then(childSnapshots => {
        if (Array.isArray(inputData)) {
          return inputData.map(snap =>
            childSnapshots.filter(child =>
              dependencies.filter(dependency => dependency.parentSnapshotId === snap.snapshotId && dependency.childSnapshotId === child.snapshotId).length > 0
            )
          )
        } else {
          return childSnapshots
        }
      })
    )
  }

  async getSnapshotWhereUsed (inputData) {
    const snapshotId = Array.isArray(inputData) ? inputData.map(snap => snap.snapshotId) : inputData.snapshotId
    return Registry.SnapshotDependency.getByChildId(this.name, snapshotId).then(dependencies =>
      Registry.AppSnapshot.where(this.name, { snapshotId: dependencies.map(dependency => dependency.parentSnapshotId) }).then(parentSnapshots => {
        if (Array.isArray(inputData)) {
          return inputData.map(snap =>
            parentSnapshots.filter(parent =>
              dependencies.filter(dependency => dependency.childSnapshotId === snap.snapshotId && dependency.parentSnapshotId === parent.snapshotId).length > 0
            )
          )
        } else {
          return parentSnapshots
        }
      })
    )
  }

  async getSnapshotObjects (inputData) {
    const snapshotId = Array.isArray(inputData) ? inputData.map(snap => snap.snapshotId) : inputData.snapshotId
    return Registry.SnapshotObjectDependency.getByParentId(this.name, snapshotId).then(dependencies =>
      Registry.ObjectVersion.where(this.name, { objectVersionId: dependencies.map(dependency => dependency.objectVersionId) }).then(childObjects => {
        if (Array.isArray(inputData)) {
          return inputData.map(snap =>
            childObjects.filter(child =>
              dependencies.filter(dependency => dependency.snapshotId === snap.snapshotId && dependency.objectVersionId === child.objectVersionId).length > 0
            )
          )
        } else {
          return childObjects
        }
      })
    )
  }

  async getObjects (objectCriteria, snapshotCriteria) {
    return Registry.ObjectVersion.where(this.name, objectCriteria, snapshotCriteria)
  }

  async getObjectDependencies (inputData, snapshotCriteria) {
    const objectVersionId = Array.isArray(inputData) ? inputData.map(obj => obj.objectVersionId) : inputData.objectVersionId
    return Registry.ObjectDependency.getByParentId(this.name, objectVersionId).then(dependencies =>
      Registry.ObjectVersion.where(this.name, { objectVersionId: dependencies.map(dependency => dependency.childObjectVersionId) }).then(childObjectCandidates => {
        if (snapshotCriteria) {
          return this.getSnapshots(snapshotCriteria)
            .then(snapshots => this.getSnapshotObjects(snapshots))
            .then(arrays => [].concat.apply([], arrays))
            .then(snapshotsObjects =>
              childObjectCandidates.filter(obj => snapshotsObjects.filter(snapObj => snapObj.objectVersionId === obj.objectVersionId).length > 0)
            )
        } else {
          return childObjectCandidates
        }
      }).then(childObjects => {
        if (Array.isArray(inputData)) {
          return inputData.map(obj =>
            childObjects.filter(child =>
              dependencies.filter(dependency => dependency.parentObjectVersionId === obj.objectVersionId &&
                dependency.childObjectVersionId === child.objectVersionId).length > 0
            )
          )
        } else {
          return childObjects
        }
      })
    )
  }

  async getObjectWhereUsed (inputData, snapshotCriteria) {
    const objectVersionId = Array.isArray(inputData) ? inputData.map(obj => obj.objectVersionId) : inputData.objectVersionId
    return Registry.ObjectDependency.getByChildId(this.name, objectVersionId).then(dependencies =>
      Registry.ObjectVersion.where(this.name, { objectVersionId: dependencies.map(dependency => dependency.parentObjectVersionId) }).then(parentObjectCandidates => {
        if (snapshotCriteria) {
          return this.getSnapshots(snapshotCriteria)
            .then(snapshots => this.getSnapshotObjects(snapshots))
            .then(arrays => [].concat.apply([], arrays))
            .then(snapshotsObjects =>
              parentObjectCandidates.filter(obj => snapshotsObjects.filter(snapObj => snapObj.objectVersionId === obj.objectVersionId).length > 0)
            )
        } else {
          return parentObjectCandidates
        }
      }).then(parentObjects => {
        if (Array.isArray(inputData)) {
          return inputData.map(obj =>
            parentObjects.filter(parent =>
              dependencies.filter(dependency => dependency.childObjectVersionId === obj.objectVersionId &&
                dependency.parentObjectVersionId === parent.objectVersionId).length > 0
            )
          )
        } else {
          return parentObjects
        }
      })
    )
  }

  async getObjectSnapshots (inputData) {
    const objectVersionId = Array.isArray(inputData) ? inputData.map(obj => obj.objectVersionId) : inputData.objectVersionId
    return Registry.SnapshotObjectDependency.getByChildId(this.name, objectVersionId).then(dependencies =>
      Registry.AppSnapshot.where(this.name, { snapshotId: dependencies.map(dependency => dependency.snapshotId) }).then(parentSnapshots => {
        if (Array.isArray(inputData)) {
          return inputData.map(obj =>
            parentSnapshots.filter(parent =>
              dependencies.filter(dependency => dependency.snapshotId === parent.snapshotId && dependency.objectVersionId === obj.objectVersionId).length > 0
            )
          )
        } else {
          return parentSnapshots
        }
      })
    )
  }

  async getLeafNodes () {
    return getWithoutChildren(this.name, 1, [])
  }

  async getTopLevelNodes () {
    return getWithoutParents(this.name, 1, [])
  }
}

module.exports = Workspace
