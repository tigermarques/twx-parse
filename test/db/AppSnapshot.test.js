
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
let AppSnapshot = require('../../src/db/AppSnapshot')
let commonDB = require('../../src/db/common')

chai.use(sinonChai)
chai.use(chaiAsPromised)
const { expect } = chai

describe('DB - AppSnapshot', () => {
  let dbStub

  beforeEach(() => {
    delete require.cache[require.resolve('../../src/db/common')]
    delete require.cache[require.resolve('../../src/db/AppSnapshot')]
    commonDB = require('../../src/db/common')
    dbStub = sinon.stub(commonDB, 'getDB')
    AppSnapshot = require('../../src/db/AppSnapshot')
  })

  afterEach(() => {
    dbStub.restore()
    delete require.cache[require.resolve('../../src/db/AppSnapshot')]
  })

  it('should have the correct methods', () => {
    expect(AppSnapshot).to.be.an('object')
    expect(AppSnapshot).to.respondTo('register')
    expect(AppSnapshot).to.respondTo('update')
    expect(AppSnapshot).to.respondTo('getAll')
    expect(AppSnapshot).to.respondTo('getById')
    expect(AppSnapshot).to.respondTo('where')
    expect(AppSnapshot).to.respondTo('find')
    expect(AppSnapshot).to.respondTo('remove')
    expect(AppSnapshot).to.respondTo('removeOrphaned')
  })

  it('should reject the "register" method when query execution returns an error', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.register('test.db', {
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: false
    })
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      const args = runStub.getCall(0).args
      expect(args[1]).to.eql(['snapshot1', 'appId1', 'branchId1', 'snapshotName1', 'branchName1', 'appShortName1', 'appName1', 1, 0])
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "register" method when query execution succeeds', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, null)
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result1 = AppSnapshot.register('test.db', {
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: true
    })
    const result2 = AppSnapshot.register('test.db', {
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      snapshotName: 'snapshotName2',
      branchName: 'branchName2',
      appShortName: 'appShortName2',
      appName: 'appName2',
      isToolkit: false,
      isObjectsProcessed: false
    })
    return Promise.all([
      expect(result1).to.eventually.be.fulfilled,
      expect(result2).to.eventually.be.fulfilled
    ]).then(() => {
      expect(dbStub).to.have.been.calledTwice
      expect(dbStub).to.have.been.calledWith('test.db')
      const args1 = runStub.getCall(0).args
      expect(args1[1]).to.eql(['snapshot1', 'appId1', 'branchId1', 'snapshotName1', 'branchName1', 'appShortName1', 'appName1', 1, 1])
      const args2 = runStub.getCall(1).args
      expect(args2[1]).to.eql(['snapshot2', 'appId2', 'branchId2', 'snapshotName2', 'branchName2', 'appShortName2', 'appName2', 0, 0])
      expect(closeStub).to.have.been.calledTwice
    })
  })

  it('should reject the "update" method when query execution returns an error', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.update('test.db', 'snapshot1')
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      const args = runStub.getCall(0).args
      expect(args[1]).to.eql(['snapshot1'])
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "update" method when query execution succeeds', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, null)
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.update('test.db', 'snapshot1', {
      snapshotName: 'snapshotName1'
    })
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      const args = runStub.getCall(0).args
      expect(args[1]).to.eql(['snapshotName1', 'snapshot1'])
      expect(closeStub).to.have.been.calledOnce
    })
  })

  it('should reject the "getAll" method when query execution returns an error', () => {
    const allStub = sinon.stub().callsArgWithAsync(1, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.getAll('test.db')
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "getAll" method when query execution succeeds', () => {
    const allStub = sinon.stub().callsArgWithAsync(1, null, [{
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: false
    }])
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.getAll('test.db')
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql([{
        snapshotId: 'snapshot1',
        appId: 'appId1',
        branchId: 'branchId1',
        snapshotName: 'snapshotName1',
        branchName: 'branchName1',
        appShortName: 'appShortName1',
        appName: 'appName1',
        isToolkit: true,
        isObjectsProcessed: false
      }])
    })
  })

  it('should reject the "getById" method when query execution returns an error', () => {
    const getStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.getById('test.db', 'snapshot1')
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      const args = getStub.getCall(0).args
      expect(args[1]).to.eql(['snapshot1'])
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "getById" method when query execution succeeds', () => {
    const getStub = sinon.stub().callsArgWithAsync(2, null, {
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: false
    })
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.getById('test.db', 'snapshot1')
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      const args = getStub.getCall(0).args
      expect(args[1]).to.eql(['snapshot1'])
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql({
        snapshotId: 'snapshot1',
        appId: 'appId1',
        branchId: 'branchId1',
        snapshotName: 'snapshotName1',
        branchName: 'branchName1',
        appShortName: 'appShortName1',
        appName: 'appName1',
        isToolkit: true,
        isObjectsProcessed: false
      })
    })
  })

  it('should reject the "where" method when query execution returns an error', () => {
    const allStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.where('test.db', {
      branchName: 'branchName1'
    })
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "where" method when query execution succeeds', () => {
    const allStub = sinon.stub().callsArgWithAsync(2, null, [{
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: false
    }])
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.where('test.db', {
      branchName: 'branchName1'
    })
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql([{
        snapshotId: 'snapshot1',
        appId: 'appId1',
        branchId: 'branchId1',
        snapshotName: 'snapshotName1',
        branchName: 'branchName1',
        appShortName: 'appShortName1',
        appName: 'appName1',
        isToolkit: true,
        isObjectsProcessed: false
      }])
    })
  })

  it('should reject the "find" method when query execution returns an error', () => {
    const getStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.find('test.db', {
      branchName: 'branchName1'
    })
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "find" method when query execution succeeds', () => {
    const getStub = sinon.stub().callsArgWithAsync(2, null, {
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      snapshotName: 'snapshotName1',
      branchName: 'branchName1',
      appShortName: 'appShortName1',
      appName: 'appName1',
      isToolkit: true,
      isObjectsProcessed: false
    })
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.find('test.db', {
      branchName: ['branchName1', 'branchName2']
    })
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql({
        snapshotId: 'snapshot1',
        appId: 'appId1',
        branchId: 'branchId1',
        snapshotName: 'snapshotName1',
        branchName: 'branchName1',
        appShortName: 'appShortName1',
        appName: 'appName1',
        isToolkit: true,
        isObjectsProcessed: false
      })
    })
  })

  it('should reject the "remove" method when query execution returns an error', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.remove('test.db', {
      snapshotName: 'snapshotName1'
    })
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "remove" method when query execution succeeds', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, null)
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.remove('test.db')
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
    })
  })

  it('should reject the "removeOrphaned" method when query execution returns an error', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.removeOrphaned('test.db')
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "removeOrphaned" method when query execution succeeds', () => {
    const runStub = sinon.stub().callsArgWithAsync(2, null)
    const closeStub = sinon.stub()
    dbStub.returns({
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = AppSnapshot.removeOrphaned('test.db')
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
    })
  })
})
