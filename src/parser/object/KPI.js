const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseKPI = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const kpi = jsonData.teamworks.metric[0]
  const versionId = kpi.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = kpi.$.id
    result.name = kpi.$.name
    result.type = TYPES.KPI
    result.dependencies = []

    if (kpi.rollupMetricRef && !ParseUtils.isNullXML(kpi.rollupMetricRef[0])) {
      result.dependencies.push(kpi.rollupMetricRef[0])
    }
  }

  return result
}, 'parseKPI')

module.exports = parseKPI
