const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseUserAttribute = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const userAttribute = jsonData.teamworks.userAttributeDefinition[0]
  const versionId = userAttribute.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = userAttribute.$.id
    result.name = userAttribute.$.name
    result.type = TYPES.UserAttribute
    result.dependencies = []

    if (userAttribute.classRef && !ParseUtils.isNullXML(userAttribute.classRef[0])) {
      result.dependencies.push(userAttribute.classRef[0])
    }
  }

  return result
}, 'parseUserAttribute')

module.exports = parseUserAttribute
