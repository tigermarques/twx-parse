const EventEmitter = require('events')
const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const AppSnapshot = require('../../classes/AppSnapshot')
const SnapshotDependency = require('../../classes/SnapshotDependency')
const SnapshotObjectDependency = require('../../classes/SnapshotObjectDependency')

const addPackage = async (databaseName, zipFile, fileName, startCallback, progressCallback, endCallback) => {
  const packageEntry = zipFile.getEntry('META-INF/package.xml')

  const jsonData = await ParseUtils.parseXML(packageEntry.getData().toString('utf-8'), fileName)
  const snapshot = jsonData.package.target[0].snapshot[0]
  const project = jsonData.package.target[0].project[0]
  const branch = jsonData.package.target[0].branch[0]
  const parentSnapshotId = snapshot.$.id

  // only parse the package if it hasn't been added yet
  const existingAppSnapshot = await Registry.AppSnapshot.getById(databaseName, parentSnapshotId)
  if (!existingAppSnapshot) {
    const appSnapshot = new AppSnapshot(databaseName, parentSnapshotId, project.$.id, branch.$.id, project.$.shortName, snapshot.$.name, project.$.name, branch.$.name, project.$.isToolkit === 'true', false)
    await Registry.AppSnapshot.register(databaseName, appSnapshot)

    startCallback({
      id: parentSnapshotId,
      name: fileName,
      total: (jsonData.package.dependencies[0].dependency ? jsonData.package.dependencies[0].dependency.length : 0) +
        (jsonData.package.objects[0].object ? jsonData.package.objects[0].object.length : 0)
    })

    if (jsonData.package.dependencies[0].dependency) {
      const objectsToAdd = jsonData.package.dependencies[0].dependency.map(dependency =>
        new SnapshotDependency(databaseName, parentSnapshotId, dependency.snapshot[0].$.id, Number(dependency.$.rank), dependency.$.id))
      await Registry.SnapshotDependency.registerMany(databaseName, objectsToAdd)
      progressCallback({
        id: parentSnapshotId,
        data: objectsToAdd
      })
      // bar.increment(jsonData.package.dependencies[0].dependency.length)
    }

    if (jsonData.package.objects[0].object) {
      const objectsToAdd = jsonData.package.objects[0].object.filter(obj => obj.$.type !== 'SmartFolder').map(obj =>
        new SnapshotObjectDependency(databaseName, parentSnapshotId, obj.$.versionId, obj.$.id))
      await Registry.SnapshotObjectDependency.registerMany(databaseName, objectsToAdd)
      progressCallback({
        id: parentSnapshotId,
        data: objectsToAdd
      })
    }
    endCallback({
      id: parentSnapshotId
    })
  } else {
    console.log(`Skipping package ${parentSnapshotId}`)
  }
}

const removePackage = async (databaseName, zipFile, fileName) => {
  const packageEntry = zipFile.getEntry('META-INF/package.xml')

  const jsonData = await ParseUtils.parseXML(packageEntry.getData().toString('utf-8'), fileName)
  const snapshot = jsonData.package.target[0].snapshot[0]
  const parentSnapshotId = snapshot.$.id

  // only parse the package if it exists and is not a toolkit
  const existingAppSnapshot = await Registry.AppSnapshot.getById(databaseName, parentSnapshotId)
  if (existingAppSnapshot && !existingAppSnapshot.isToolkit) {
    await Registry.SnapshotObjectDependency.remove(databaseName, { snapshotId: parentSnapshotId })
    await Registry.SnapshotDependency.remove(databaseName, { parentSnapshotId: parentSnapshotId })
    await Registry.AppSnapshot.remove(databaseName, { snapshotId: parentSnapshotId })

    let allSnapshots = await Registry.AppSnapshot.getAll(databaseName)
    let appSnapshotCount = allSnapshots.length
    console.log(`I currently have ${appSnapshotCount} snapshots`)
    while (true) {
      await Registry.AppSnapshot.removeOrphaned(databaseName)
      await Registry.SnapshotDependency.removeOrphaned(databaseName)
      await Registry.SnapshotObjectDependency.removeOrphaned(databaseName)
      await Registry.ObjectVersion.removeOrphaned(databaseName)
      await Registry.ObjectDependency.removeOrphaned(databaseName)

      allSnapshots = await Registry.AppSnapshot.getAll(databaseName)
      const newAppSnapshotCount = allSnapshots.length
      console.log(`I currently have ${newAppSnapshotCount} snapshots`)
      if (appSnapshotCount === newAppSnapshotCount) {
        break
      } else {
        appSnapshotCount = newAppSnapshotCount
      }
    }
  } else {
    console.log(`Skipping package ${parentSnapshotId}`)
  }
}

class PackageParser extends EventEmitter {
  constructor (databaseName) {
    super()
    this.databaseName = databaseName
  }

  add (zipFile, fileName) {
    return addPackage(this.databaseName, zipFile, fileName, data => {
      this.emit('start', {
        id: data.id,
        name: data.name,
        total: data.total
      })
    }, data => {
      this.emit('progress', data)
    }, () => {
      this.emit('end')
    })
  }

  remove (zipFile, fileName) {
    return removePackage(this.databaseName, zipFile, fileName)
  }
}

module.exports = PackageParser
