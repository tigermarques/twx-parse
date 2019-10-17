const fs = require('fs')
const Registry = require('./src/classes/Registry')
const twxParser = require('.')
const Performance = require('./src/utils/Performance')

const folder = 'C:\\Users\\jgmarques\\Desktop\\TWX2'
const files = fs.readdirSync(folder)
console.time('measure')

;(async () => {
  const pool = await twxParser.getWorkspace('test', 'password')

  for (let i = 0; i < files.length; i++) {
    const fileName = folder + '\\' + files[i]
    console.log(`Will remove file ${fileName}`)
    await pool.removeFile(fileName)
  }

  Registry.AppSnapshot.getAll('test.db').then(results => console.log(`${results.length} AppSnapshot`)).catch(console.log)
  Registry.ObjectVersion.getAll('test.db').then(results => console.log(`${results.length} ObjectVersion`)).catch(console.log)
  Registry.SnapshotDependency.getAll('test.db').then(results => console.log(`${results.length} SnapshotDependency`)).catch(console.log)
  Registry.SnapshotObjectDependency.getAll('test.db').then(results => console.log(`${results.length} SnapshotObjectDependency`)).catch(console.log)
  Registry.ObjectDependency.getAll('test.db').then(results => console.log(`${results.length} ObjectDependency`)).catch(console.log)
  console.timeEnd('measure')
  Performance.listAll()
})()
