const Performance = require('../utils/Performance')
const { getDB } = require('./common')

const getParamsFromItem = item =>
  [item.snapshotId, item.appId, item.branchId, item.snapshotName, item.branchName, item.appShortName, item.appName, item.isToolkit ? 1 : 0, item.isObjectsProcessed]

const buildWhereQuery = obj => {
  let whereClause = '1 = 1'
  const parameters = []
  if (obj) {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        whereClause += ` and ${key} in (${obj[key].map((item) => `'${item}'`).join(', ')})`
        // parameters = parameters.concat(obj[key])
      } else {
        whereClause += ` and ${key} = '${obj[key]}'`
        // parameters.push(obj[key])
      }
    }
  }
  return [whereClause, parameters]
}

module.exports = {
  register: Performance.makeMeasurable((databaseName, item) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const sql = `insert into AppSnapshot (snapshotId, appId, branchId, snapshotName, branchName, appShortName, appname, isToolkit, isObjectsProcessed)
                  values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      const params = getParamsFromItem(item)
      db.run(sql, params, err => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
      db.close()
    })
  }, 'db.AppSnapshot.register'),

  update: Performance.makeMeasurable((databaseName, snapshotId, obj) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const updateFields = []
      const parameters = []
      if (obj) {
        for (const key in obj) {
          updateFields.push(`${key} = ?`)
          parameters.push(obj[key])
        }
      }
      parameters.push(snapshotId)
      const sql = `update AppSnapshot set ${updateFields.join(', ')} where snapshotId = ?`
      db.run(sql, parameters, (err) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
      db.close()
    })
  }, 'db.AppSnapshot.update'),

  getAll: Performance.makeMeasurable((databaseName) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const sql = 'select * from AppSnapshot'
      db.all(sql, (err, results) => {
        if (err) {
          reject(err)
          return
        }
        resolve(results)
      })
      db.close()
    })
  }, 'db.AppSnapshot.getAll'),

  getById: Performance.makeMeasurable((databaseName, snapshotId) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const sql = 'select * from AppSnapshot where snapshotId = ?'
      db.get(sql, [snapshotId], (err, item) => {
        if (err) {
          reject(err)
          return
        }
        resolve(item)
      })
      db.close()
    })
  }, 'db.AppSnapshot.getById'),

  where: Performance.makeMeasurable((databaseName, obj) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const [whereClause, parameters] = buildWhereQuery(obj)
      const sql = `select * from AppSnapshot where ${whereClause}`
      db.all(sql, parameters, (err, results) => {
        if (err) {
          reject(err)
          return
        }
        resolve(results)
      })
      db.close()
    })
  }, 'db.AppSnapshot.where'),

  find: Performance.makeMeasurable((databaseName, obj) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const [whereClause, parameters] = buildWhereQuery(obj)
      const sql = `select * from AppSnapshot where ${whereClause}`
      db.get(sql, parameters, (err, item) => {
        if (err) {
          reject(err)
          return
        }
        resolve(item)
      })
      db.close()
    })
  }, 'db.AppSnapshot.find'),

  remove: Performance.makeMeasurable((databaseName, obj) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const [whereClause, parameters] = buildWhereQuery(obj)
      const sql = `delete from AppSnapshot where ${whereClause}`
      db.run(sql, parameters, (err, item) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
      db.close()
    })
  }, 'db.AppSnapshot.remove'),

  removeOrphaned: Performance.makeMeasurable((databaseName) => {
    return new Promise((resolve, reject) => {
      const db = getDB(databaseName)
      const sql = `delete from AppSnapshot
                  where snapshotId in (
                    select childApp.snapshotId
                    from AppSnapshot childApp
                    left join SnapshotDependency sd on sd.childSnapshotId = childApp.snapshotId
                    where childApp.isToolkit = 1 and sd.childSnapshotId is null
                  )`
      db.run(sql, [], (err, item) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
      db.close()
    })
  }, 'db.AppSnapshot.removeOrphaned')
}
