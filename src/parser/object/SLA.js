const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseSLA = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const sla = jsonData.teamworks.sla[0]
  const versionId = sla.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = sla.$.id
    result.name = sla.$.name
    result.type = TYPES.SLA
    result.dependencies = []

    if (sla.participantRef && !ParseUtils.isNullXML(sla.participantRef[0])) {
      result.dependencies.push(sla.participantRef[0])
    }
    if (sla.xmlData && sla.xmlData[0] && sla.xmlData[0].condition && !ParseUtils.isNullXML(sla.xmlData[0].condition[0])) {
      result.dependencies.push(sla.xmlData[0].condition[0].$.metricId)
    }
  }

  return result
}, 'parseSLA')

module.exports = parseSLA
