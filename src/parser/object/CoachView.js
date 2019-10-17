const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseCoachView = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const coachView = jsonData.teamworks.coachView[0]
  const versionId = coachView.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = coachView.$.id
    result.name = coachView.$.name
    result.type = TYPES.CoachView
    result.dependencies = []

    // Layout
    if (coachView.layout && !ParseUtils.isNullXML(coachView.layout[0])) {
      const layoutString = coachView.layout[0]
      const jsonLayout = await ParseUtils.parseXML(layoutString, 'layout')
      const viewIds = ParseUtils.xpath(jsonLayout, '//viewUUID')
      if (viewIds) {
        viewIds.map(viewId => {
          result.dependencies.push(viewId)
        })
      }
    }

    // Preview Image
    if (coachView.previewImage && !ParseUtils.isNullXML(coachView.previewImage[0])) {
      result.dependencies.push(coachView.previewImage[0])
    }

    // Palette Icon
    if (coachView.paletteIcon && !ParseUtils.isNullXML(coachView.paletteIcon[0])) {
      result.dependencies.push(coachView.paletteIcon[0])
    }

    // Binding
    if (coachView.bindingType && !ParseUtils.isNullXML(coachView.bindingType[0]) && coachView.bindingType[0].classId && !ParseUtils.isNullXML(coachView.bindingType[0].classId[0])) {
      result.dependencies.push(coachView.bindingType[0].classId[0])
    }

    // Config Options
    if (coachView.configOption) {
      for (let i = 0; i < coachView.configOption.length; i++) {
        if (!ParseUtils.isNullXML(coachView.configOption[i]) && coachView.configOption[i].classId && !ParseUtils.isNullXML(coachView.configOption[i].classId[0])) {
          result.dependencies.push(coachView.configOption[i].classId[0])
        }
      }
    }

    // Resource
    if (coachView.resource) {
      for (let i = 0; i < coachView.resource.length; i++) {
        if (!ParseUtils.isNullXML(coachView.resource[i]) && coachView.resource[i].assetUuid && !ParseUtils.isNullXML(coachView.resource[i].assetUuid[0])) {
          result.dependencies.push(coachView.resource[i].assetUuid[0])
        }
      }
    }

    // Localization Resources
    if (coachView.localization) {
      for (let i = 0; i < coachView.localization.length; i++) {
        if (!ParseUtils.isNullXML(coachView.localization[i]) && coachView.localization[i].assetUuid && !ParseUtils.isNullXML(coachView.localization[i].resourceBundleGroupId[0])) {
          result.dependencies.push(coachView.localization[i].resourceBundleGroupId[0])
        }
      }
    }
  }

  return result
}, 'parseCoachView')

module.exports = parseCoachView
