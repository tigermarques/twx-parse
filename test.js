const fs = require('fs')
const cliProgress = require('cli-progress')
const Registry = require('./src/classes/Registry')
const twxParser = require('.')
const Performance = require('./src/utils/Performance')

const folder = 'C:\\Users\\jgmarques\\Desktop\\TWX'
const files = fs.readdirSync(folder)
console.time('measure')

let bar = null

;(async () => {
  const pool = await twxParser.getWorkspace('test', 'password')
  // ['packageStart', 'packageProgress', 'packageEnd', 'objectStart', 'objectProgress', 'objectEnd']
  pool.on('packageStart', data => {
    bar = new cliProgress.SingleBar({
      format: `Package - ${data.name} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
    })
    bar.start(data.total, 0)
  })

  pool.on('packageProgress', data => {
    bar.increment(data.data.length)
  })

  pool.on('packageEnd', data => {
    bar.stop()
  })

  pool.on('objectStart', data => {
    bar = new cliProgress.SingleBar({
      format: `Object - ${data.name} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
    })
    bar.start(data.total, 0)
  })

  pool.on('objectProgress', data => {
    bar.increment(data.data.length)
  })

  pool.on('objectEnd', data => {
    bar.stop()
  })

  for (let i = 0; i < files.length; i++) {
    const fileName = folder + '\\' + files[i]
    console.log(`Will add file ${fileName}`)
    await pool.addFile(fileName)
  }

  Registry.AppSnapshot.getAll('test.db').then(results => console.log(`${results.length} AppSnapshot`)).catch(console.log)
  Registry.ObjectVersion.getAll('test.db').then(results => console.log(`${results.length} ObjectVersion`)).catch(console.log)
  Registry.SnapshotDependency.getAll('test.db').then(results => console.log(`${results.length} SnapshotDependency`)).catch(console.log)
  Registry.SnapshotObjectDependency.getAll('test.db').then(results => console.log(`${results.length} SnapshotObjectDependency`)).catch(console.log)
  Registry.ObjectDependency.getAll('test.db').then(results => console.log(`${results.length} ObjectDependency`)).catch(console.log)

  // pool.getSnapshots({ snapshotId: '2064.d2c6b37b-4559-44f6-94fd-bbfed6976153' }).then(apps => apps[0].getToolkits()).then(console.log).catch(console.log)

  pool.getObjects({ type: '1', subtype: '6', name: 'Get Customers List' }, { appShortName: 'BNKIT' })
    // .then(objs => Promise.all(objs.map(obj => pool.getObjectWhereUsed(obj, { appShortName: 'BPARC' }))))
    .then(objs => pool.getObjectSnapshots(objs))
    // .then(arrays => [].concat.apply([], arrays))
    .then(console.log)
    .catch(console.log)
  /* pool.getSnapshots({ snapshotId: ['2064.e030ed6f-43c7-42bf-a068-a2a4c516f25d', '2064.8b4e5413-a66c-46b0-944b-538fd65feb2f'] })
    .then(snapshots => {
      console.log(snapshots)
      return snapshots
    })
    .then(snapshot => pool.getSnapshotObjects(snapshot))
    .then(objects => {
      console.log(objects.length)
      objects.map(obj => console.log(obj.length))
    })
    .catch(console.log) */

  console.timeEnd('measure')
  Performance.listAll()
})()

/* console.time('measure')
const pool = new ApplicationPool()
pool.addFile('C:\\Users\\jgmarques\\Desktop\\Subscrição_Multicaixa - MCX03.07.twx').then(() => {
  // return pool.addFile('C:\\Users\\jgmarques\\Desktop\\Subscrição_Multicaixa - MCX03.09.twx')
}).then(() => {
  console.log(Registry.AppSnapshot.getAll().length)
  console.log(Registry.SnapshotDependency.getAll().length)
  console.log(Registry.SnapshotObjectDependency.getAll().length)
  console.log(Registry.ObjectVersion.getAll().length)
  console.log(Registry.ObjectDependency.getAll().length)
  // console.log(Registry.AppSnapshot.getById('2064.0d36ac6e-a588-4494-9c5f-2198f69640c6').getToolkits())
  // console.log(Registry.AppSnapshot.getById('2064.0d36ac6e-a588-4494-9c5f-2198f69640c6').getWhereUsed())
  // console.log(Registry.AppSnapshot.getById('2064.0d36ac6e-a588-4494-9c5f-2198f69640c6').getObjects())
  // console.log(Registry.ObjectVersion.getAll().length)
  // const obj = Registry.AppSnapshot.getById('2064.0d36ac6e-a588-4494-9c5f-2198f69640c6').getObjects()[0]
  // console.log(obj.getWhereUsed())
  // console.log(Registry.AppSnapshot.where({ appShortName: 'EBDS' }))
  console.log(Registry.ObjectVersion.getById('d3846be4-d23d-4905-b468-e08cd9491d89'))
  console.timeEnd('measure')
}).catch(err => {
  console.error(err)
}) */
