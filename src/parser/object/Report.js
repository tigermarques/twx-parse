const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseReport = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const report = jsonData.teamworks.report[0]
  const versionId = report.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    result.register = true
    result.id = report.$.id
    result.name = report.$.name
    result.type = TYPES.Report
    result.dependencies = []

    if (report.participantRef && !ParseUtils.isNullXML(report.participantRef[0])) {
      result.dependencies.push(report.participantRef[0])
      result.dependencies.push(report.participantRef[0])
    }

    if (report.ReportTGLink) {
      for (let i = 0; i < report.ReportTGLink.length; i++) {
        if (!ParseUtils.isNullXML(report.ReportTGLink[i]) && report.ReportTGLink[i].trackingGroupRef && !ParseUtils.isNullXML(report.ReportTGLink[i].trackingGroupRef[0])) {
          result.dependencies.push(report.ReportTGLink[i].trackingGroupRef[0])
        }
      }
    }

    if (report.ReportEpvLink) {
      for (let i = 0; i < report.ReportEpvLink.length; i++) {
        if (!ParseUtils.isNullXML(report.ReportEpvLink[i]) && report.ReportEpvLink[i].epvRef && !ParseUtils.isNullXML(report.ReportEpvLink[i].epvRef[0])) {
          result.dependencies.push(report.ReportEpvLink[i].epvRef[0])
        }
      }
    }

    if (report.ReportRbgLink) {
      for (let i = 0; i < report.ReportRbgLink.length; i++) {
        if (!ParseUtils.isNullXML(report.ReportRbgLink[i]) && report.ReportRbgLink[i].rbgRef && !ParseUtils.isNullXML(report.ReportRbgLink[i].rbgRef[0])) {
          result.dependencies.push(report.ReportRbgLink[i].rbgRef[0])
        }
      }
    }
  }

  return result
}, 'parseReport')

module.exports = parseReport
