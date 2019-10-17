const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseEnvironmentVariables = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const environmentVariableSet = jsonData.teamworks.environmentVariableSet[0]
  const versionId = environmentVariableSet.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = environmentVariableSet.$.id
    result.name = environmentVariableSet.$.name
    result.type = TYPES.EnvironmentVariable
    result.dependencies = []
  }

  return result
}, 'parseEnvironmentVariables')

module.exports = parseEnvironmentVariables
