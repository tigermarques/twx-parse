const path = require('path')
const fs = require('fs')
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const commonDB = require('../../src/db/common')
const { defer } = require('../test-utilities')

const TEST_PATH = path.resolve(__dirname, 'data')

chai.use(sinonChai)
const { expect } = chai

const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath)
      } else { // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

describe('DB - Common', () => {
  beforeEach(() => {
    deleteFolderRecursive(TEST_PATH)
  })
  afterEach(() => {
    process.env.TWXPARSE_DATA_FOLDER = null
    delete require.cache[require.resolve('../../src/db/common')]
    require('../../src/db/common')
    deleteFolderRecursive(TEST_PATH)
  })
  it('should have the correct methods', () => {
    expect(commonDB).to.be.an('object')
    expect(commonDB).to.respondTo('getDB')
    expect(commonDB).to.respondTo('checkAccess')
  })

  it('should create a new folder when a new path is given', () => {
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    delete require.cache[require.resolve('../../src/db/common')]
    require('../../src/db/common')
    expect(fs.existsSync(process.env.TWXPARSE_DATA_FOLDER)).to.be.true
  })

  it('should open the database correctly', () => {
    const stub = sinon.stub(sqlite3, 'Database').returns({})
    expect(stub).not.to.have.been.called
    const result1 = commonDB.getDB('test.db')
    expect(result1).to.eql({})
    expect(stub).to.have.been.calledOnce
    expect(stub).to.have.been.calledWith(path.join(__dirname, '..', '..', 'data', 'test.db'))
    const result2 = commonDB.getDB()
    expect(result2).to.eql({})
    expect(stub).to.have.been.calledTwice
    expect(stub).to.have.been.calledWith(path.join(__dirname, '..', '..', 'data', 'database.db'))
    stub.restore()
  })

  it('should deny access when no database name is given', () => {
    const result = commonDB.checkAccess()
    return expect(result).eventually.be.rejected.then(error => {
      expect(error.message).to.equal('No database name supplied')
    })
  })

  it('should deny access when no password is given', () => {
    const result = commonDB.checkAccess('test.db')
    return expect(result).eventually.be.rejected.then(error => {
      expect(error.message).to.equal('No password supplied')
    })
  })

  it('should always allow to create a new database with any password', () => {
    const stub = sinon.stub(bcrypt, 'hash').returns(defer(true, 'hashedExample'))
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    expect(stub).not.to.have.been.called
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.fulfilled.then(() => {
      expect(stub).to.have.been.calledOnce
      expect(stub).to.have.been.calledWith('password', 10)
      const fileContent = fs.readFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'utf8')
      expect(fileContent).to.equal('hashedExample')
      stub.restore()
    })
  })

  it('should clear any old password files if the database does not exist', () => {
    const stub = sinon.stub(bcrypt, 'hash').returns(defer(true, 'hashedExample'))
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    fs.mkdirSync(process.env.TWXPARSE_DATA_FOLDER)
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'data')
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    expect(stub).not.to.have.been.called
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.fulfilled.then(() => {
      expect(stub).to.have.been.calledOnce
      expect(stub).to.have.been.calledWith('password', 10)
      const fileContent = fs.readFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'utf8')
      expect(fileContent).to.equal('hashedExample')
      stub.restore()
    })
  })

  it('should deny access when the database exists but the password file does not', () => {
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    fs.mkdirSync(process.env.TWXPARSE_DATA_FOLDER)
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db'), 'data')
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.rejected.then((error) => {
      expect(error.message).to.equal('Password file missing')
    })
  })

  it('should grant access when the password is correct', () => {
    const stub = sinon.stub(bcrypt, 'compare').returns(defer(true, true))
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    fs.mkdirSync(process.env.TWXPARSE_DATA_FOLDER)
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'hashedExample')
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db'), 'data')
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    expect(stub).not.to.have.been.called
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.fulfilled.then(() => {
      expect(stub).to.have.been.calledOnce
      expect(stub).to.have.been.calledWith('password', 'hashedExample')
      stub.restore()
    })
  })

  it('should deny access when the password is incorrect', () => {
    const stub = sinon.stub(bcrypt, 'compare').returns(defer(true, false))
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    fs.mkdirSync(process.env.TWXPARSE_DATA_FOLDER)
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'hashedExample')
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db'), 'data')
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    expect(stub).not.to.have.been.called
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.rejected.then((error) => {
      expect(error.message).to.equal('Password mismatch')
      expect(stub).to.have.been.calledOnce
      expect(stub).to.have.been.calledWith('password', 'hashedExample')
      stub.restore()
    })
  })

  it('should deny access when the password comparison encounters an error', () => {
    const stub = sinon.stub(bcrypt, 'compare').returns(defer(false))
    process.env.TWXPARSE_DATA_FOLDER = TEST_PATH
    fs.mkdirSync(process.env.TWXPARSE_DATA_FOLDER)
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db.txt'), 'hashedExample')
    fs.writeFileSync(path.resolve(process.env.TWXPARSE_DATA_FOLDER, 'test.db'), 'data')
    delete require.cache[require.resolve('../../src/db/common')]
    const newCommonDB = require('../../src/db/common')
    expect(stub).not.to.have.been.called
    const result = newCommonDB.checkAccess('test.db', 'password')

    return expect(result).eventually.be.rejected.then(() => {
      expect(stub).to.have.been.calledOnce
      expect(stub).to.have.been.calledWith('password', 'hashedExample')
      stub.restore()
    })
  })
})
