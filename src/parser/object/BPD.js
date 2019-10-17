const ParseUtils = require('../../utils/XML')
const Registry = require('../../classes/Registry')
const { TYPES, SUBTYPES: { BPD: BPD_TYPES } } = require('../../utils/Constants')
const Performance = require('../../utils/Performance')

const parseBPD = Performance.makeMeasurable(async (databaseName, jsonData) => {
  // only parse the object if it hasn't been added yet
  const bpd = jsonData.teamworks.bpd[0]
  const versionId = bpd.versionId[0]
  const result = {
    register: false,
    versionId
  }
  const item = await Registry.ObjectVersion.getById(databaseName, versionId)
  if (!item) {
    let subType = BPD_TYPES.BPD
    if (bpd.type && !ParseUtils.isNullXML(bpd.type[0]) && bpd.type[0] === BPD_TYPES.Process) {
      subType = BPD_TYPES.Process
    }
    result.register = true
    result.id = bpd.$.id
    result.name = bpd.$.name
    result.type = TYPES.BPD
    result.subType = subType
    result.dependencies = []

    // Exposed to Start
    if (bpd.participantRef && !ParseUtils.isNullXML(bpd.participantRef[0])) {
      result.dependencies.push(bpd.participantRef[0])
    }

    // Exposed Data
    if (bpd.businessDataParticipantRef && !ParseUtils.isNullXML(bpd.businessDataParticipantRef[0])) {
      result.dependencies.push(bpd.businessDataParticipantRef[0])
    }

    // Exposed Metrics
    if (bpd.perfMetricParticipantRef && !ParseUtils.isNullXML(bpd.perfMetricParticipantRef[0])) {
      result.dependencies.push(bpd.perfMetricParticipantRef[0])
    }

    // Owner
    if (bpd.ownerTeamParticipantRef && !ParseUtils.isNullXML(bpd.ownerTeamParticipantRef[0])) {
      result.dependencies.push(bpd.ownerTeamParticipantRef[0])
    }

    // Input and Output Parameters
    if (bpd.bpdParameter) {
      for (let i = 0; i < bpd.bpdParameter.length; i++) {
        if (!ParseUtils.isNullXML(bpd.bpdParameter[i]) && bpd.bpdParameter[i].classId && !ParseUtils.isNullXML(bpd.bpdParameter[i].classId[0])) {
          result.dependencies.push(bpd.bpdParameter[i].classId[0])
        }
      }
    }

    // Diagram
    if (bpd.BusinessProcessDiagram && !ParseUtils.isNullXML(bpd.BusinessProcessDiagram[0])) {
      const diagram = bpd.BusinessProcessDiagram[0]
      // metric settings
      if (diagram.metricSettings && !ParseUtils.isNullXML(diagram.metricSettings[0]) && diagram.metricSettings[0].settings) {
        for (let i = 0; i < diagram.metricSettings[0].settings.length; i++) {
          if (!ParseUtils.isNullXML(diagram.metricSettings[0].settings[i])) {
            result.dependencies.push(diagram.metricSettings[0].settings[i].$.metricId)
          }
        }
      }

      if (diagram.pool && !ParseUtils.isNullXML(diagram.pool[0])) {
        const pool = diagram.pool[0]

        // Variables
        if (pool.privateVariable) {
          for (let i = 0; i < pool.privateVariable.length; i++) {
            if (!ParseUtils.isNullXML(pool.privateVariable[i]) && pool.privateVariable[i].classId && !ParseUtils.isNullXML(pool.privateVariable[i].classId[0])) {
              result.dependencies.push(pool.privateVariable[i].classId[0])
            }
          }
        }

        // EPVs
        if (pool.epv) {
          for (let i = 0; i < pool.epv.length; i++) {
            if (!ParseUtils.isNullXML(pool.epv[i]) && pool.epv[i].epvId && !ParseUtils.isNullXML(pool.epv[i].epvId[0])) {
              result.dependencies.push(pool.epv[i].epvId[0])
            }
          }
        }

        // participants
        const participants = ParseUtils.xpath(pool, '//attachedParticipant')
        if (participants) {
          participants.map(participantId => {
            result.dependencies.push(participantId)
          })
        }

        // teams
        const teams = ParseUtils.xpath(pool, '//teamRef')
        if (teams) {
          teams.map(teamId => {
            result.dependencies.push(teamId)
          })
        }

        // UCA Events
        const attachedUCAs = ParseUtils.xpath(pool, '//attachedUcaId')
        if (attachedUCAs) {
          attachedUCAs.map(ucaId => {
            result.dependencies.push(ucaId)
          })
        }

        // Attached activities
        const attachedActivities = ParseUtils.xpath(pool, '//attachedActivityId')
        if (attachedActivities) {
          attachedActivities.map(attachedActivityId => {
            result.dependencies.push(attachedActivityId)
          })
        }

        // Attached Processes
        const attachedProcesses = ParseUtils.xpath(pool, '//attachedProcessId')
        if (attachedProcesses) {
          attachedProcesses.map(attachedProcessId => {
            result.dependencies.push(attachedProcessId)
          })
        }

        // Attached Services
        const services = ParseUtils.xpath(pool, '//serviceRef')
        if (services) {
          services.map(serviceId => {
            result.dependencies.push(serviceId)
          })
        }
      }
    }
  }

  return result
}, 'parseBPD')

module.exports = parseBPD
