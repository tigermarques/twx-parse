const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseResource = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const resource = jsonData.teamworks.resourceBundleGroup[0]
  const versionId = resource.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = resource.$.id
    result.name = resource.$.name
    result.type = TYPES.Resource
    result.dependencies = []
  }

  return result
}, 'parseResource')

module.exports = parseResource
