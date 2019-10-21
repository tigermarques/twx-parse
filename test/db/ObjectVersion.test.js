
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
let ObjectVersion = require('../../src/db/ObjectVersion')
let commonDB = require('../../src/db/common')

chai.use(sinonChai)
chai.use(chaiAsPromised)
const { expect } = chai

describe('DB - ObjectVersion', () => {
  let dbStub

  beforeEach(() => {
    delete require.cache[require.resolve('../../src/db/common')]
    delete require.cache[require.resolve('../../src/db/ObjectVersion')]
    commonDB = require('../../src/db/common')
    dbStub = sinon.stub(commonDB, 'getDB')
    ObjectVersion = require('../../src/db/ObjectVersion')
  })

  afterEach(() => {
    dbStub.restore()
    delete require.cache[require.resolve('../../src/db/ObjectVersion')]
  })

  it('should have the correct methods', () => {
    expect(ObjectVersion).to.be.an('object')
    expect(ObjectVersion).to.respondTo('register')
    expect(ObjectVersion).to.respondTo('registerMany')
    expect(ObjectVersion).to.respondTo('getAll')
    expect(ObjectVersion).to.respondTo('getById')
    expect(ObjectVersion).to.respondTo('where')
    expect(ObjectVersion).to.respondTo('find')
    expect(ObjectVersion).to.respondTo('remove')
    expect(ObjectVersion).to.respondTo('removeOrphaned')
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
    const result = ObjectVersion.register('test.db', {
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    })
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      const args = runStub.getCall(0).args
      expect(args[1]).to.eql(['version1', 'objectId1', 'name1', 'type1', 'subtype1'])
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
    const result1 = ObjectVersion.register('test.db', {
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    })
    const result2 = ObjectVersion.register('test.db', {
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'name2',
      type: 'type2',
      subtype: 'subtype2'
    })
    return Promise.all([
      expect(result1).to.eventually.be.fulfilled,
      expect(result2).to.eventually.be.fulfilled
    ]).then(() => {
      expect(dbStub).to.have.been.calledTwice
      expect(dbStub).to.have.been.calledWith('test.db')
      const args1 = runStub.getCall(0).args
      expect(args1[1]).to.eql(['version1', 'objectId1', 'name1', 'type1', 'subtype1'])
      const args2 = runStub.getCall(1).args
      expect(args2[1]).to.eql(['version2', 'objectId2', 'name2', 'type2', 'subtype2'])
      expect(closeStub).to.have.been.calledTwice
    })
  })

  it('should reject the "registerMany" method when query execution returns an error', () => {
    const runStub = sinon.stub()
    const execStub = sinon.stub().onSecondCall().callsArgWithAsync(1, new Error('error'))
    const closeStub = sinon.stub()
    dbStub.returns({
      exec: execStub,
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.registerMany('test.db', [{
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'name2',
      type: 'type2',
      subtype: 'subtype2'
    }])
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(execStub).to.have.been.calledTwice
      expect(execStub).to.have.been.calledWith('begin')
      expect(execStub).to.have.been.calledWith('commit')
      expect(runStub).to.have.been.calledTwice
      const args1 = runStub.getCall(0).args
      expect(args1[1]).to.eql(['version1', 'objectId1', 'name1', 'type1', 'subtype1'])
      const args2 = runStub.getCall(1).args
      expect(args2[1]).to.eql(['version2', 'objectId2', 'name2', 'type2', 'subtype2'])
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "registerMany" method when query execution succeeds', () => {
    const runStub = sinon.stub()
    const execStub = sinon.stub().onSecondCall().callsArgWithAsync(1, null)
    const closeStub = sinon.stub()
    dbStub.returns({
      exec: execStub,
      run: runStub,
      close: closeStub
    })
    expect(runStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.registerMany('test.db', [{
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'name2',
      type: 'type2',
      subtype: 'subtype2'
    }])
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(execStub).to.have.been.calledTwice
      expect(execStub).to.have.been.calledWith('begin')
      expect(execStub).to.have.been.calledWith('commit')
      expect(runStub).to.have.been.calledTwice
      const args1 = runStub.getCall(0).args
      expect(args1[1]).to.eql(['version1', 'objectId1', 'name1', 'type1', 'subtype1'])
      const args2 = runStub.getCall(1).args
      expect(args2[1]).to.eql(['version2', 'objectId2', 'name2', 'type2', 'subtype2'])
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
    const result = ObjectVersion.getAll('test.db')
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
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }])
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.getAll('test.db')
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql([{
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'name1',
        type: 'type1',
        subtype: 'subtype1'
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
    const result = ObjectVersion.getById('test.db', 'version1')
    return expect(result).to.eventually.be.rejected.then(error => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      const args = getStub.getCall(0).args
      expect(args[1]).to.eql(['version1'])
      expect(closeStub).to.have.been.calledOnce
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve the "getById" method when query execution succeeds', () => {
    const getStub = sinon.stub().callsArgWithAsync(2, null, {
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    })
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.getById('test.db', 'version1')
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      const args = getStub.getCall(0).args
      expect(args[1]).to.eql(['version1'])
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql({
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'name1',
        type: 'type1',
        subtype: 'subtype1'
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
    const result = ObjectVersion.where('test.db', {
      objectId: 'objectId1'
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
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }])
    const closeStub = sinon.stub()
    dbStub.returns({
      all: allStub,
      close: closeStub
    })
    expect(allStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.where('test.db', {
      objectId: 'ojectId1'
    }, {
      snapshotId: 'snapshot1'
    })
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(allStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql([{
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'name1',
        type: 'type1',
        subtype: 'subtype1'
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
    const result = ObjectVersion.find('test.db', {
      objectId: 'objectId1'
    }, {
      snapshotId: ['snapshot1', 'snapshot2']
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
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    })
    const closeStub = sinon.stub()
    dbStub.returns({
      get: getStub,
      close: closeStub
    })
    expect(getStub).not.to.have.been.called
    expect(closeStub).not.to.have.been.called
    const result = ObjectVersion.find('test.db', {
      objectId: ['objectId1', 'objectId2']
    })
    return expect(result).to.eventually.be.fulfilled.then((results) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(getStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
      expect(results).to.eql({
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'name1',
        type: 'type1',
        subtype: 'subtype1'
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
    const result = ObjectVersion.remove('test.db', {
      objectId: 'objectId1'
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
    const result = ObjectVersion.remove('test.db')
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
    const result = ObjectVersion.removeOrphaned('test.db')
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
    const result = ObjectVersion.removeOrphaned('test.db')
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('test.db')
      expect(runStub).to.have.been.calledOnce
      expect(closeStub).to.have.been.calledOnce
    })
  })
})
