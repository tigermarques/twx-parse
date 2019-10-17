const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseHistoricalScenario = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const historicalScenario = jsonData.teamworks.historicalScenario[0]
  const versionId = historicalScenario.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = historicalScenario.$.id
    result.name = historicalScenario.$.name
    result.type = TYPES.HistoricalScenario
    result.dependencies = []
  }

  return result
}, 'parseHistoricalScenario')

module.exports = parseHistoricalScenario
