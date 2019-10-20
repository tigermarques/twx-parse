const path = require('path')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
let db = require('../../src/db/index')
let commonDB = require('../../src/db/common')
const { defer } = require('../test-utilities')

const TEST_PATH = path.resolve(__dirname, 'data')

chai.use(sinonChai)
const { expect } = chai

describe('DB - Index', () => {
  before(() => {
    delete require.cache[require.resolve('../../src/db/index')]
    commonDB = require('../../src/db/common')
  })
  afterEach(() => {
    delete require.cache[require.resolve('../../src/db/index')]
    db = require('../../src/db/index')
  })
  it('should have the correct methods and objects', () => {
    expect(db).to.be.an('object')
    expect(db).to.respondTo('initialize')
    expect(db).to.have.property('AppSnapshot')
    expect(db).to.have.property('ObjectVersion')
    expect(db).to.have.property('SnapshotDependency')
    expect(db).to.have.property('SnapshotObjectDependency')
    expect(db).to.have.property('ObjectDependency')
  })

  it('should reject initialization when check password fails', () => {
    const stub = sinon.stub(commonDB, 'checkAccess').returns(defer(false))
    delete require.cache[require.resolve('../../src/db/index')]
    db = require('../../src/db/index')
    expect(stub).not.to.have.been.called
    const result = db.initialize('username', 'password')
    expect(stub).to.have.been.calledOnce
    expect(stub).to.have.been.calledWith('username', 'password')
    stub.restore()
    return expect(result).to.eventually.be.rejected
  })

  it('should reject initialization when sql execution fails', () => {
    const accessStub = sinon.stub(commonDB, 'checkAccess').returns(defer(true))
    const dbStub = sinon.stub(commonDB, 'getDB').returns({
      exec: sinon.stub().callsArgWith(1, new Error('error')),
      close: sinon.stub().resolves()
    })
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    delete require.cache[require.resolve('../../src/db/index')]
    db = require('../../src/db/index')
    expect(accessStub).not.to.have.been.called
    expect(dbStub).not.to.have.been.called
    const result = db.initialize('username', 'password')
    expect(accessStub).to.have.been.calledOnce
    expect(accessStub).to.have.been.calledWith('username', 'password')
    accessStub.restore()
    return expect(result).to.eventually.be.rejected.then((error) => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('username')
      dbStub.restore()
      expect(error.message).to.equal('error')
    })
  })

  it('should resolve initialization when sql execution succeeds', () => {
    const accessStub = sinon.stub(commonDB, 'checkAccess').returns(defer(true))
    const dbStub = sinon.stub(commonDB, 'getDB').returns({
      exec: sinon.stub().callsArgWith(1, null),
      close: sinon.stub().resolves()
    })
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    delete require.cache[require.resolve('../../src/db/index')]
    db = require('../../src/db/index')
    expect(accessStub).not.to.have.been.called
    expect(dbStub).not.to.have.been.called
    const result = db.initialize('username', 'password')
    expect(accessStub).to.have.been.calledOnce
    expect(accessStub).to.have.been.calledWith('username', 'password')
    accessStub.restore()
    return expect(result).to.eventually.be.fulfilled.then(() => {
      expect(dbStub).to.have.been.calledOnce
      expect(dbStub).to.have.been.calledWith('username')
      dbStub.restore()
    })
  })
})
