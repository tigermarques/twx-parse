const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseEventSubscription = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const eventSubscription = jsonData.teamworks.eventSubscription[0]
  const versionId = eventSubscription.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = eventSubscription.$.id
    result.name = eventSubscription.$.name
    result.type = TYPES.EventSubscription
    result.dependencies = []

    if (eventSubscription.processRef && !ParseUtils.isNullXML(eventSubscription.processRef[0])) {
      result.dependencies.push(eventSubscription.processRef[0])
    }
    if (eventSubscription.participantRef && !ParseUtils.isNullXML(eventSubscription.participantRef[0])) {
      result.dependencies.push(eventSubscription.participantRef[0])
    }
  }

  return result
}, 'parseEventSubscription')

module.exports = parseEventSubscription
