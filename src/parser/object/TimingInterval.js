const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseTimingInterval = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const timing = jsonData.teamworks.timingInterval[0]
  const versionId = timing.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = timing.$.id
    result.name = timing.$.name
    result.type = TYPES.TimingInterval
    result.dependencies = []
  }

  return result
}, 'parseTimingInterval')

module.exports = parseTimingInterval
