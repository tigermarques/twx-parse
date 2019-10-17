const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseProjectDefaults = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const projectDefaults = jsonData.teamworks.projectDefaults[0]
  const versionId = projectDefaults.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = projectDefaults.$.id
    result.name = projectDefaults.$.name
    result.type = TYPES.ProjectDefaults
    result.dependencies = []

    if (projectDefaults.defaultXslRef && !ParseUtils.isNullXML(projectDefaults.defaultXslRef[0])) {
      result.dependencies.push(projectDefaults.defaultXslRef[0])
    }
    if (projectDefaults.defaultCssRef && !ParseUtils.isNullXML(projectDefaults.defaultCssRef[0])) {
      result.dependencies.push(projectDefaults.defaultCssRef[0])
    }
    if (projectDefaults.defaultTheme && !ParseUtils.isNullXML(projectDefaults.defaultTheme[0])) {
      result.dependencies.push(projectDefaults.defaultTheme[0])
    }
  }

  return result
}, 'parseProjectDefaults')

module.exports = parseProjectDefaults
