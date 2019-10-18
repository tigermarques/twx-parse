const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
// const chaiSubset = require('chai-subset')
const Workspace = require('../../src/classes/Workspace')
const Registry = require('../../src/classes/Registry')
const Parser = require('../../src/parser')
const { defer } = require('../test-utilities')

chai.use(sinonChai)
chai.use(chaiAsPromised)
// chai.use(chaiSubset)
const { expect } = chai

describe('Classes - Workspace', () => {
  let workspace, parser

  beforeEach(() => {
    workspace = new Workspace('name1')
    parser = workspace.parser
  })
  it('should be a class', () => {
    expect(Workspace).to.be.a('function')
  })

  it('should create objects correctly', () => {
    expect(workspace).to.have.property('name', 'name1')
    expect(workspace).to.have.property('parser')
    expect(workspace.parser).to.be.an.instanceOf(Parser)
    expect(workspace).to.respondTo('addFile')
    expect(workspace).to.respondTo('removeFile')
    expect(workspace).to.respondTo('getSnapshots')
    expect(workspace).to.respondTo('getSnapshotDependencies')
    expect(workspace).to.respondTo('getSnapshotWhereUsed')
    expect(workspace).to.respondTo('getSnapshotObjects')
    expect(workspace).to.respondTo('getObjects')
    expect(workspace).to.respondTo('getObjectDependencies')
    expect(workspace).to.respondTo('getObjectWhereUsed')
    expect(workspace).to.respondTo('getObjectSnapshots')
  })

  it('should emit events received from the parser', () => {
    const events = ['packageStart', 'packageProgress', 'packageEnd', 'objectStart', 'objectProgress', 'objectEnd']
    events.map(event => {
      const stub = sinon.stub()
      workspace.on(event, stub)
      expect(stub).not.to.have.been.called
      parser.emit(event, 'data')
      expect(stub).to.have.been.calledWith('data')
      workspace.off(event, stub)
    })
  })

  it('should make all the correct calls in the "addFile" method', () => {
    const stub = sinon.stub(parser, 'addFile').returns(defer())
    expect(stub).not.to.have.been.called
    const result = workspace.addFile('file')
    expect(stub).to.have.been.calledWith('file')
    return expect(result).to.eventually.be.fulfilled
  })

  it('should make all the correct calls in the "removeFile" method', () => {
    const stub = sinon.stub(parser, 'removeFile').returns(defer())
    expect(stub).not.to.have.been.called
    const result = workspace.removeFile('file')
    expect(stub).to.have.been.calledWith('file')
    return expect(result).to.eventually.be.fulfilled
  })

  it('should make all the correct calls in the "getSnapshots" method', () => {
    const stubEmpty = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, []))
    expect(stubEmpty).not.to.have.been.called
    const resultEmpty = workspace.getSnapshots({ appName: 'appName1' })
    expect(stubEmpty).to.have.been.calledOnce
    expect(stubEmpty).to.have.been.calledWith('name1', { appName: 'appName1' })
    stubEmpty.restore()

    const stubResults = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name1',
      snapshotId: 'snapshotId1',
      appId: 'appId1',
      branchId: 'branchId1',
      appShortName: 'appShortName1',
      snapshotName: 'snapshotName1',
      appName: 'appName1',
      branchName: 'branchName1',
      isToolkit: true,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshotId2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }]))
    expect(stubResults).not.to.have.been.called
    const resultResults = workspace.getSnapshots({ appName: 'appName1' })
    expect(stubResults).to.have.been.calledOnce
    expect(stubResults).to.have.been.calledWith('name1', { appName: 'appName1' })
    stubResults.restore()

    const stubReject = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(false))
    expect(stubReject).not.to.have.been.called
    const resultReject = workspace.getSnapshots({ appName: 'appName1' })
    expect(stubReject).to.have.been.calledOnce
    expect(stubReject).to.have.been.calledWith('name1', { appName: 'appName1' })
    stubReject.restore()

    return Promise.all([
      expect(resultEmpty).to.eventually.become([]),
      expect(resultResults).to.eventually.be.fulfilled.then(data => {
        expect(data.length).to.equal(2)
        expect(data).to.containSubset([{
          workspace: 'name1',
          snapshotId: 'snapshotId1',
          appId: 'appId1',
          branchId: 'branchId1',
          appShortName: 'appShortName1',
          snapshotName: 'snapshotName1',
          appName: 'appName1',
          branchName: 'branchName1',
          isToolkit: true,
          isObjectsProcessed: false
        }, {
          workspace: 'name1',
          snapshotId: 'snapshotId2',
          appId: 'appId2',
          branchId: 'branchId2',
          appShortName: 'appShortName2',
          snapshotName: 'snapshotName2',
          appName: 'appName2',
          branchName: 'branchName2',
          isToolkit: false,
          isObjectsProcessed: false
        }])
      }),
      expect(resultReject).to.eventually.be.rejected
    ])
  })

  it('should return an array of snapshots when the "getSnapshotDependencies" method is invoked with a single snapshot', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByParentId').returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency1'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot3',
      rank: 2,
      dependencyId: 'dependency2'
    }]))
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name1',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: true,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getSnapshotDependencies({ snapshotId: 'snapshot1' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'snapshot1')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot2', 'snapshot3'] })
      stubSnapshots.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([{
        workspace: 'name1',
        snapshotId: 'snapshot2',
        appId: 'appId2',
        branchId: 'branchId2',
        appShortName: 'appShortName2',
        snapshotName: 'snapshotName2',
        appName: 'appName2',
        branchName: 'branchName2',
        isToolkit: true,
        isObjectsProcessed: false
      }, {
        workspace: 'name1',
        snapshotId: 'snapshot3',
        appId: 'appId3',
        branchId: 'branchId3',
        appShortName: 'appShortName3',
        snapshotName: 'snapshotName3',
        appName: 'appName3',
        branchName: 'branchName3',
        isToolkit: true,
        isObjectsProcessed: false
      }])
    })
  })

  it('should return an array of arrays of snapshots when the "getSnapshotDependencies" method is invoked with an array of snapshots', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByParentId').returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency1'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot3',
      rank: 2,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot4',
      rank: 3,
      dependencyId: 'dependency3'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency4'
    }]))
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name1',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: true,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshot4',
      appId: 'appId4',
      branchId: 'branchId4',
      appShortName: 'appShortName4',
      snapshotName: 'snapshotName4',
      appName: 'appName4',
      branchName: 'branchName4',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getSnapshotDependencies([{ snapshotId: 'snapshot1' }, { snapshotId: 'snapshot3' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1', 'snapshot3'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot2', 'snapshot3', 'snapshot4', 'snapshot2'] })
      stubSnapshots.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([
        [{
          workspace: 'name1',
          snapshotId: 'snapshot2',
          appId: 'appId2',
          branchId: 'branchId2',
          appShortName: 'appShortName2',
          snapshotName: 'snapshotName2',
          appName: 'appName2',
          branchName: 'branchName2',
          isToolkit: true,
          isObjectsProcessed: false
        }, {
          workspace: 'name1',
          snapshotId: 'snapshot3',
          appId: 'appId3',
          branchId: 'branchId3',
          appShortName: 'appShortName3',
          snapshotName: 'snapshotName3',
          appName: 'appName3',
          branchName: 'branchName3',
          isToolkit: true,
          isObjectsProcessed: false
        }, {
          workspace: 'name1',
          snapshotId: 'snapshot4',
          appId: 'appId4',
          branchId: 'branchId4',
          appShortName: 'appShortName4',
          snapshotName: 'snapshotName4',
          appName: 'appName4',
          branchName: 'branchName4',
          isToolkit: true,
          isObjectsProcessed: false
        }],
        [{
          workspace: 'name1',
          snapshotId: 'snapshot2',
          appId: 'appId2',
          branchId: 'branchId2',
          appShortName: 'appShortName2',
          snapshotName: 'snapshotName2',
          appName: 'appName2',
          branchName: 'branchName2',
          isToolkit: true,
          isObjectsProcessed: false
        }]
      ])
    })
  })

  it('should return an array of snapshots when the "getSnapshotWhereUsed" method is invoked with a single snapshot', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByChildId').returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency1'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency2'
    }]))
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name1',
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      appShortName: 'appShortName1',
      snapshotName: 'snapshotName1',
      appName: 'appName1',
      branchName: 'branchName1',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getSnapshotWhereUsed({ snapshotId: 'snapshot2' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'snapshot2')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot1', 'snapshot3'] })
      stubSnapshots.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([{
        workspace: 'name1',
        snapshotId: 'snapshot1',
        appId: 'appId1',
        branchId: 'branchId1',
        appShortName: 'appShortName1',
        snapshotName: 'snapshotName1',
        appName: 'appName1',
        branchName: 'branchName1',
        isToolkit: false,
        isObjectsProcessed: false
      }, {
        workspace: 'name1',
        snapshotId: 'snapshot3',
        appId: 'appId3',
        branchId: 'branchId3',
        appShortName: 'appShortName3',
        snapshotName: 'snapshotName3',
        appName: 'appName3',
        branchName: 'branchName3',
        isToolkit: true,
        isObjectsProcessed: false
      }])
    })
  })

  it('should return an array of arrays of snapshots when the "getSnapshotWhereUsed" method is invoked with an array of snapshots', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByChildId').returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency1'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot3',
      rank: 2,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency4'
    }]))
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name1',
      snapshotId: 'snapshot1',
      appId: 'appId1',
      branchId: 'branchId1',
      appShortName: 'appShortName1',
      snapshotName: 'snapshotName1',
      appName: 'appName1',
      branchName: 'branchName1',
      isToolkit: true,
      isObjectsProcessed: false
    }, {
      workspace: 'name1',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getSnapshotWhereUsed([{ snapshotId: 'snapshot2' }, { snapshotId: 'snapshot3' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot2', 'snapshot3'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot1', 'snapshot1', 'snapshot3'] })
      stubSnapshots.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([
        [{
          workspace: 'name1',
          snapshotId: 'snapshot1',
          appId: 'appId1',
          branchId: 'branchId1',
          appShortName: 'appShortName1',
          snapshotName: 'snapshotName1',
          appName: 'appName1',
          branchName: 'branchName1',
          isToolkit: true,
          isObjectsProcessed: false
        }, {
          workspace: 'name1',
          snapshotId: 'snapshot3',
          appId: 'appId3',
          branchId: 'branchId3',
          appShortName: 'appShortName3',
          snapshotName: 'snapshotName3',
          appName: 'appName3',
          branchName: 'branchName3',
          isToolkit: true,
          isObjectsProcessed: false
        }],
        [{
          workspace: 'name1',
          snapshotId: 'snapshot1',
          appId: 'appId1',
          branchId: 'branchId1',
          appShortName: 'appShortName1',
          snapshotName: 'snapshotName1',
          appName: 'appName1',
          branchName: 'branchName1',
          isToolkit: true,
          isObjectsProcessed: false
        }]
      ])
    })
  })

  it('should make all the correct calls in the "getObjects" method', () => {
    const stubEmpty = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, []))
    expect(stubEmpty).not.to.have.been.called
    const resultEmpty = workspace.getObjects({ objectId: 'objectId1' })
    expect(stubEmpty).to.have.been.calledOnce
    expect(stubEmpty).to.have.been.calledWith('name1', { objectId: 'objectId1' })
    stubEmpty.restore()

    const stubResults = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'versionId1',
      objectId: 'objectId1',
      name: 'versionName1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'versionId2',
      objectId: 'objectId2',
      name: 'versionName2',
      type: 'type2',
      subtype: 'subtype2'
    }]))
    expect(stubResults).not.to.have.been.called
    const resultResults = workspace.getObjects({ objectId: 'objectId1' })
    expect(stubResults).to.have.been.calledOnce
    expect(stubResults).to.have.been.calledWith('name1', { objectId: 'objectId1' })
    stubResults.restore()

    const stubReject = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(false))
    expect(stubReject).not.to.have.been.called
    const resultReject = workspace.getObjects({ objectId: 'objectId1' })
    expect(stubReject).to.have.been.calledOnce
    expect(stubReject).to.have.been.calledWith('name1', { objectId: 'objectId1' })
    stubReject.restore()

    return Promise.all([
      expect(resultEmpty).to.eventually.become([]),
      expect(resultResults).to.eventually.be.fulfilled.then(data => {
        expect(data.length).to.equal(2)
        expect(data).to.containSubset([{
          workspace: 'name1',
          objectVersionId: 'versionId1',
          objectId: 'objectId1',
          name: 'versionName1',
          type: 'type1',
          subtype: 'subtype1'
        }, {
          workspace: 'name1',
          objectVersionId: 'versionId2',
          objectId: 'objectId2',
          name: 'versionName2',
          type: 'type2',
          subtype: 'subtype2'
        }])
      }),
      expect(resultReject).to.eventually.be.rejected
    ])
  })
})
