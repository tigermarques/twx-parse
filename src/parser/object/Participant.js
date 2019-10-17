const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseParticipant = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const participant = jsonData.teamworks.participant[0]
  const versionId = participant.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = participant.$.id
    result.name = participant.$.name
    result.type = TYPES.Participant
    result.dependencies = []

    if (participant.managersRef && !ParseUtils.isNullXML(participant.managersRef[0])) {
      result.dependencies.push(participant.managersRef[0])
    }
  }

  return result
}, 'parseParticipant')

module.exports = parseParticipant
