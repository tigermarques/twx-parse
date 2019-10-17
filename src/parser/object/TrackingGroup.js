const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseTrackingGroup = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const trackingGroup = jsonData.teamworks.trackingGroup[0]
  const versionId = trackingGroup.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = trackingGroup.$.id
    result.name = trackingGroup.$.name
    result.type = TYPES.TrackingGroup
    result.dependencies = []
  }

  return result
}, 'parseTrackingGroup')

module.exports = parseTrackingGroup
