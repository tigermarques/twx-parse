const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseEPV = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const epv = jsonData.teamworks.epv[0]
  const versionId = epv.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = epv.$.id
    result.name = epv.$.name
    result.type = TYPES.EPV
    result.dependencies = []

    if (epv.participantRef && !ParseUtils.isNullXML(epv.participantRef[0])) {
      result.dependencies.push(epv.participantRef[0])
    }
  }

  return result
}, 'parseEPV')

module.exports = parseEPV
