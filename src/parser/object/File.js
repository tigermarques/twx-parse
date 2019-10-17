const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseFile = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const file = jsonData.teamworks.managedAsset[0]
  const versionId = file.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = file.$.id
    result.name = file.$.name
    result.type = TYPES.File
    result.dependencies = []
  }

  return result
}, 'parseFile')

module.exports = parseFile
