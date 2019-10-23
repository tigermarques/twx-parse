const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')
const chaiSubset = require('chai-subset')
const Workspace = require('../../src/classes/Workspace')
const Registry = require('../../src/classes/Registry')
const Parser = require('../../src/parser')
const { defer } = require('../test-utilities')

chai.use(sinonChai)
chai.use(chaiAsPromised)
chai.use(chaiSubset)
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

  it('should return an array of objects when the "getSnapshotObjects" method is invoked with a single snapshot', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByParentId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot1',
      objectVersionId: 'version2',
      objectId: 'objectId2'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'name2',
      type: 'type2',
      subtype: 'subtype2'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getSnapshotObjects({ snapshotId: 'snapshot1' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'snapshot1')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version1', 'version2'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([{
        workspace: 'name1',
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'name1',
        type: 'type1',
        subtype: 'subtype1'
      }, {
        workspace: 'name1',
        objectVersionId: 'version2',
        objectId: 'objectId2',
        name: 'name2',
        type: 'type2',
        subtype: 'subtype2'
      }])
    })
  })

  it('should return an array of arrays of objects when the "getSnapshotObjects" method is invoked with an array of snapshots', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByParentId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot1',
      objectVersionId: 'version2',
      objectId: 'objectId2'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version2',
      objectId: 'objectId2'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'name1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'name2',
      type: 'type2',
      subtype: 'subtype2'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getSnapshotObjects([{ snapshotId: 'snapshot1' }, { snapshotId: 'snapshot2' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1', 'snapshot2'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version1', 'version2', 'version2'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([
        [{
          workspace: 'name1',
          objectVersionId: 'version1',
          objectId: 'objectId1',
          name: 'name1',
          type: 'type1',
          subtype: 'subtype1'
        }, {
          workspace: 'name1',
          objectVersionId: 'version2',
          objectId: 'objectId2',
          name: 'name2',
          type: 'type2',
          subtype: 'subtype2'
        }],
        [{
          workspace: 'name1',
          objectVersionId: 'version2',
          objectId: 'objectId2',
          name: 'name2',
          type: 'type2',
          subtype: 'subtype2'
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

  it('should return an array of objects when the "getObjectDependencies" method is invoked with a single object version', () => {
    const stubDependencies = sinon.stub(Registry.ObjectDependency, 'getByParentId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version3'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'versionName2',
      type: 'type2',
      subtype: 'subtype2'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectDependencies({ objectVersionId: 'version1' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'version1')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version2', 'version3'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([{
        workspace: 'name1',
        objectVersionId: 'version2',
        objectId: 'objectId2',
        name: 'versionName2',
        type: 'type2',
        subtype: 'subtype2'
      }, {
        workspace: 'name1',
        objectVersionId: 'version3',
        objectId: 'objectId3',
        name: 'versionName3',
        type: 'type3',
        subtype: 'subtype3'
      }])
    })
  })

  it('should return an array of arrays of objects when the "getObjectDependencies" method is invoked with an array of object versions', () => {
    const stubDependencies = sinon.stub(Registry.ObjectDependency, 'getByParentId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version3'
    }, {
      parentObjectVersionId: 'version3',
      childObjectVersionId: 'version2'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'versionName2',
      type: 'type2',
      subtype: 'subtype2'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectDependencies([{ objectVersionId: 'version1' }, { objectVersionId: 'version3' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['version1', 'version3'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version2', 'version3', 'version2'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([
        [{
          workspace: 'name1',
          objectVersionId: 'version2',
          objectId: 'objectId2',
          name: 'versionName2',
          type: 'type2',
          subtype: 'subtype2'
        }, {
          workspace: 'name1',
          objectVersionId: 'version3',
          objectId: 'objectId3',
          name: 'versionName3',
          type: 'type3',
          subtype: 'subtype3'
        }],
        [{
          workspace: 'name1',
          objectVersionId: 'version2',
          objectId: 'objectId2',
          name: 'versionName2',
          type: 'type2',
          subtype: 'subtype2'
        }]
      ])
    })
  })

  it('should filter results when the "getObjectDependencies" method is invoked with snapshot context', () => {
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
    }]))
    const stubSnapshotObjectsDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByParentId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version2',
      objectId: 'objectId2'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version3',
      objectId: 'objectId3'
    }]))
    const stubObjectDependencies = sinon.stub(Registry.ObjectDependency, 'getByParentId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version3'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version2',
      objectId: 'objectId2',
      name: 'versionName2',
      type: 'type2',
      subtype: 'subtype2'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubSnapshots).not.to.have.been.called
    expect(stubSnapshotObjectsDependencies).not.to.have.been.called
    expect(stubObjectDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectDependencies({ objectVersionId: 'version1' }, { snapshotId: 'snapshot1' })
    expect(stubObjectDependencies).to.have.been.calledOnce
    expect(stubObjectDependencies).to.have.been.calledWith('name1', 'version1')
    stubObjectDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: 'snapshot1' })
      expect(stubSnapshotObjectsDependencies).to.have.been.calledOnce
      expect(stubSnapshotObjectsDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubObjects).to.have.been.calledTwice
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version2', 'version3'] })
      stubObjects.restore()
      stubSnapshots.restore()
      stubSnapshotObjectsDependencies.restore()
      expect(data.length).to.equal(1)
      expect(data).to.containSubset([{
        workspace: 'name1',
        objectVersionId: 'version2',
        objectId: 'objectId2',
        name: 'versionName2',
        type: 'type2',
        subtype: 'subtype2'
      }])
    })
  })

  it('should return an array of objects when the "getObjectWhereUsed" method is invoked with a single object version', () => {
    const stubDependencies = sinon.stub(Registry.ObjectDependency, 'getByChildId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version3',
      childObjectVersionId: 'version2'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'versionName1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectWhereUsed({ objectVersionId: 'version2' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'version2')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version1', 'version3'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([{
        workspace: 'name1',
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'versionName1',
        type: 'type1',
        subtype: 'subtype1'
      }, {
        workspace: 'name1',
        objectVersionId: 'version3',
        objectId: 'objectId3',
        name: 'versionName3',
        type: 'type3',
        subtype: 'subtype3'
      }])
    })
  })

  it('should return an array of arrays of objects when the "getObjectWhereUsed" method is invoked with an array of object versions', () => {
    const stubDependencies = sinon.stub(Registry.ObjectDependency, 'getByChildId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version3',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version3'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'versionName1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectWhereUsed([{ objectVersionId: 'version2' }, { objectVersionId: 'version3' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['version2', 'version3'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubObjects).to.have.been.calledOnce
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version1', 'version3', 'version1'] })
      stubObjects.restore()
      expect(data.length).to.equal(2)
      expect(data).to.containSubset([
        [{
          workspace: 'name1',
          objectVersionId: 'version1',
          objectId: 'objectId1',
          name: 'versionName1',
          type: 'type1',
          subtype: 'subtype1'
        }, {
          workspace: 'name1',
          objectVersionId: 'version3',
          objectId: 'objectId3',
          name: 'versionName3',
          type: 'type3',
          subtype: 'subtype3'
        }],
        [{
          workspace: 'name1',
          objectVersionId: 'version1',
          objectId: 'objectId1',
          name: 'versionName1',
          type: 'type1',
          subtype: 'subtype1'
        }]
      ])
    })
  })

  it('should filter results when the "getObjectWhereUsed" method is invoked with snapshot context', () => {
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
    }]))
    const stubSnapshotObjectsDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByParentId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version3',
      objectId: 'objectId3'
    }]))
    const stubObjectDependencies = sinon.stub(Registry.ObjectDependency, 'getByChildId').returns(defer(true, [{
      parentObjectVersionId: 'version1',
      childObjectVersionId: 'version2'
    }, {
      parentObjectVersionId: 'version3',
      childObjectVersionId: 'version2'
    }]))
    const stubObjects = sinon.stub(Registry.ObjectVersion, 'where').returns(defer(true, [{
      workspace: 'name1',
      objectVersionId: 'version1',
      objectId: 'objectId1',
      name: 'versionName1',
      type: 'type1',
      subtype: 'subtype1'
    }, {
      workspace: 'name1',
      objectVersionId: 'version3',
      objectId: 'objectId3',
      name: 'versionName3',
      type: 'type3',
      subtype: 'subtype3'
    }]))
    expect(stubSnapshots).not.to.have.been.called
    expect(stubSnapshotObjectsDependencies).not.to.have.been.called
    expect(stubObjectDependencies).not.to.have.been.called
    expect(stubObjects).not.to.have.been.called

    const result = workspace.getObjectWhereUsed({ objectVersionId: 'version2' }, { snapshotId: 'snapshot1' })
    expect(stubObjectDependencies).to.have.been.calledOnce
    expect(stubObjectDependencies).to.have.been.calledWith('name1', 'version2')
    stubObjectDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: 'snapshot1' })
      expect(stubSnapshotObjectsDependencies).to.have.been.calledOnce
      expect(stubSnapshotObjectsDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubObjects).to.have.been.calledTwice
      expect(stubObjects).to.have.been.calledWith('name1', { objectVersionId: ['version1', 'version3'] })
      stubObjects.restore()
      stubSnapshots.restore()
      stubSnapshotObjectsDependencies.restore()
      expect(data.length).to.equal(1)
      expect(data).to.containSubset([{
        workspace: 'name1',
        objectVersionId: 'version1',
        objectId: 'objectId1',
        name: 'versionName1',
        type: 'type1',
        subtype: 'subtype1'
      }])
    })
  })

  it('should return an array of snapshots when the "getObjectSnapshots" method is invoked with a single object version', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByChildId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version1',
      objectId: 'objectId1'
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
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getObjectSnapshots({ objectVersionId: 'version1' })
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', 'version1')
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot1', 'snapshot2'] })
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
        isToolkit: true,
        isObjectsProcessed: false
      }, {
        workspace: 'name1',
        snapshotId: 'snapshot2',
        appId: 'appId2',
        branchId: 'branchId2',
        appShortName: 'appShortName2',
        snapshotName: 'snapshotName2',
        appName: 'appName2',
        branchName: 'branchName2',
        isToolkit: false,
        isObjectsProcessed: false
      }])
    })
  })

  it('should return an array of arrays of snapshots when the "getObjectSnapshots" method is invoked with an array of object versions', () => {
    const stubDependencies = sinon.stub(Registry.SnapshotObjectDependency, 'getByChildId').returns(defer(true, [{
      snapshotId: 'snapshot1',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version1',
      objectId: 'objectId1'
    }, {
      snapshotId: 'snapshot2',
      objectVersionId: 'version3',
      objectId: 'objectId3'
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
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }]))
    expect(stubDependencies).not.to.have.been.called
    expect(stubSnapshots).not.to.have.been.called

    const result = workspace.getObjectSnapshots([{ objectVersionId: 'version1' }, { objectVersionId: 'version3' }])
    expect(stubDependencies).to.have.been.calledOnce
    expect(stubDependencies).to.have.been.calledWith('name1', ['version1', 'version3'])
    stubDependencies.restore()

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', { snapshotId: ['snapshot1', 'snapshot2', 'snapshot2'] })
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
          snapshotId: 'snapshot2',
          appId: 'appId2',
          branchId: 'branchId2',
          appShortName: 'appShortName2',
          snapshotName: 'snapshotName2',
          appName: 'appName2',
          branchName: 'branchName2',
          isToolkit: false,
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
          isToolkit: false,
          isObjectsProcessed: false
        }]
      ])
    })
  })

  it('should return leaf nodes when the "getLeafNodes" method is invoked', () => {
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'getWithoutChildren').returns(defer(true, [{
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
    }]))
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByChildId').returns(defer(true, [{
      parentSnapshotId: 'snapshot2',
      childSnapshotId: 'snapshot1',
      rank: 1,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot1',
      rank: 1,
      dependencyId: 'dependency3'
    }]))
    const stubParents = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
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
    expect(stubSnapshots).not.to.have.been.called
    expect(stubDependencies).not.to.have.been.called
    expect(stubParents).not.to.have.been.called

    const result = workspace.getLeafNodes()
    expect(result).to.be.an.instanceOf(Promise)

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', [])
      expect(stubDependencies).to.have.been.calledOnce
      expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubParents).to.have.been.calledOnce
      expect(stubParents).to.have.been.calledWith('name1', {
        snapshotId: ['snapshot2', 'snapshot3']
      })
      expect(data).to.containSubset({
        level: 1,
        items: [{
          snapshot: {
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
          },
          parents: [{
            workspace: 'name2',
            snapshotId: 'snapshot2',
            appId: 'appId2',
            branchId: 'branchId2',
            appShortName: 'appShortName2',
            snapshotName: 'snapshotName2',
            appName: 'appName2',
            branchName: 'branchName2',
            isToolkit: false,
            isObjectsProcessed: false
          }, {
            workspace: 'name3',
            snapshotId: 'snapshot3',
            appId: 'appId3',
            branchId: 'branchId3',
            appShortName: 'appShortName3',
            snapshotName: 'snapshotName3',
            appName: 'appName3',
            branchName: 'branchName3',
            isToolkit: true,
            isObjectsProcessed: false
          }]
        }]
      })
      expect(data).to.respondTo('getNextLevel')

      stubSnapshots.restore()
      stubDependencies.restore()
      stubParents.restore()
    })
  })

  it('should return leaf nodes next level when the "getLeafNodes" method is invoked and next level is requested', () => {
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'getWithoutChildren').onFirstCall().returns(defer(true, [{
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
    }])).onSecondCall().returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
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
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByChildId').onFirstCall().returns(defer(true, [{
      parentSnapshotId: 'snapshot2',
      childSnapshotId: 'snapshot1',
      rank: 1,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot1',
      rank: 1,
      dependencyId: 'dependency3'
    }])).onSecondCall().returns(defer(true, [{
      parentSnapshotId: 'snapshot4',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency4'
    }, {
      parentSnapshotId: 'snapshot5',
      childSnapshotId: 'snapshot3',
      rank: 1,
      dependencyId: 'dependency5'
    }]))
    const stubParents = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }])).onSecondCall().returns(defer(true, [{
      workspace: 'name4',
      snapshotId: 'snapshot4',
      appId: 'appId4',
      branchId: 'branchId4',
      appShortName: 'appShortName4',
      snapshotName: 'snapshotName4',
      appName: 'appName4',
      branchName: 'branchName4',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name5',
      snapshotId: 'snapshot5',
      appId: 'appId5',
      branchId: 'branchId5',
      appShortName: 'appShortName5',
      snapshotName: 'snapshotName5',
      appName: 'appName5',
      branchName: 'branchName5',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubSnapshots).not.to.have.been.called
    expect(stubDependencies).not.to.have.been.called
    expect(stubParents).not.to.have.been.called

    const result1 = workspace.getLeafNodes()
    expect(result1).to.be.an.instanceOf(Promise)

    return expect(result1).to.eventually.be.fulfilled.then(data1 => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', [])
      expect(stubDependencies).to.have.been.calledOnce
      expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubParents).to.have.been.calledOnce
      expect(stubParents).to.have.been.calledWith('name1', {
        snapshotId: ['snapshot2', 'snapshot3']
      })
      expect(data1).to.containSubset({
        level: 1,
        items: [{
          snapshot: {
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
          },
          parents: [{
            workspace: 'name2',
            snapshotId: 'snapshot2',
            appId: 'appId2',
            branchId: 'branchId2',
            appShortName: 'appShortName2',
            snapshotName: 'snapshotName2',
            appName: 'appName2',
            branchName: 'branchName2',
            isToolkit: false,
            isObjectsProcessed: false
          }, {
            workspace: 'name3',
            snapshotId: 'snapshot3',
            appId: 'appId3',
            branchId: 'branchId3',
            appShortName: 'appShortName3',
            snapshotName: 'snapshotName3',
            appName: 'appName3',
            branchName: 'branchName3',
            isToolkit: true,
            isObjectsProcessed: false
          }]
        }]
      })
      expect(data1).to.respondTo('getNextLevel')

      const result2 = data1.getNextLevel()
      expect(result2).to.be.an.instanceOf(Promise)

      return expect(result2).to.eventually.be.fulfilled.then(data2 => {
        expect(stubSnapshots).to.have.been.calledTwice
        expect(stubSnapshots).to.have.been.calledWith('name1', ['snapshot1'])
        expect(stubDependencies).to.have.been.calledTwice
        expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot2', 'snapshot3'])
        expect(stubParents).to.have.been.calledTwice
        expect(stubParents).to.have.been.calledWith('name1', {
          snapshotId: ['snapshot4', 'snapshot5']
        })

        expect(data2).to.containSubset({
          level: 2,
          items: [{
            snapshot: {
              workspace: 'name2',
              snapshotId: 'snapshot2',
              appId: 'appId2',
              branchId: 'branchId2',
              appShortName: 'appShortName2',
              snapshotName: 'snapshotName2',
              appName: 'appName2',
              branchName: 'branchName2',
              isToolkit: false,
              isObjectsProcessed: false
            },
            parents: [{
              workspace: 'name4',
              snapshotId: 'snapshot4',
              appId: 'appId4',
              branchId: 'branchId4',
              appShortName: 'appShortName4',
              snapshotName: 'snapshotName4',
              appName: 'appName4',
              branchName: 'branchName4',
              isToolkit: false,
              isObjectsProcessed: false
            }]
          }, {
            snapshot: {
              workspace: 'name3',
              snapshotId: 'snapshot3',
              appId: 'appId3',
              branchId: 'branchId3',
              appShortName: 'appShortName3',
              snapshotName: 'snapshotName3',
              appName: 'appName3',
              branchName: 'branchName3',
              isToolkit: true,
              isObjectsProcessed: false
            },
            parents: [{
              workspace: 'name5',
              snapshotId: 'snapshot5',
              appId: 'appId5',
              branchId: 'branchId5',
              appShortName: 'appShortName5',
              snapshotName: 'snapshotName5',
              appName: 'appName5',
              branchName: 'branchName5',
              isToolkit: true,
              isObjectsProcessed: false
            }]
          }]
        })
        expect(data2).to.respondTo('getNextLevel')

        stubSnapshots.restore()
        stubDependencies.restore()
        stubParents.restore()
      })
    })
  })

  it('should return top level nodes when the "getTopLevelNodes" method is invoked', () => {
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'getWithoutParents').returns(defer(true, [{
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
    }]))
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByParentId').returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot3',
      rank: 1,
      dependencyId: 'dependency3'
    }]))
    const stubChildren = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
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
    expect(stubSnapshots).not.to.have.been.called
    expect(stubDependencies).not.to.have.been.called
    expect(stubChildren).not.to.have.been.called

    const result = workspace.getTopLevelNodes()
    expect(result).to.be.an.instanceOf(Promise)

    return expect(result).to.eventually.be.fulfilled.then(data => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', [])
      expect(stubDependencies).to.have.been.calledOnce
      expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubChildren).to.have.been.calledOnce
      expect(stubChildren).to.have.been.calledWith('name1', {
        snapshotId: ['snapshot2', 'snapshot3']
      })
      expect(data).to.containSubset({
        level: 1,
        items: [{
          snapshot: {
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
          },
          children: [{
            workspace: 'name2',
            snapshotId: 'snapshot2',
            appId: 'appId2',
            branchId: 'branchId2',
            appShortName: 'appShortName2',
            snapshotName: 'snapshotName2',
            appName: 'appName2',
            branchName: 'branchName2',
            isToolkit: false,
            isObjectsProcessed: false
          }, {
            workspace: 'name3',
            snapshotId: 'snapshot3',
            appId: 'appId3',
            branchId: 'branchId3',
            appShortName: 'appShortName3',
            snapshotName: 'snapshotName3',
            appName: 'appName3',
            branchName: 'branchName3',
            isToolkit: true,
            isObjectsProcessed: false
          }]
        }]
      })
      expect(data).to.respondTo('getNextLevel')

      stubSnapshots.restore()
      stubDependencies.restore()
      stubChildren.restore()
    })
  })

  it('should return tep level nodes next level when the "getTopLevelNodes" method is invoked and next level is requested', () => {
    const stubSnapshots = sinon.stub(Registry.AppSnapshot, 'getWithoutParents').onFirstCall().returns(defer(true, [{
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
    }])).onSecondCall().returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
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
    const stubDependencies = sinon.stub(Registry.SnapshotDependency, 'getByParentId').onFirstCall().returns(defer(true, [{
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot2',
      rank: 1,
      dependencyId: 'dependency2'
    }, {
      parentSnapshotId: 'snapshot1',
      childSnapshotId: 'snapshot3',
      rank: 1,
      dependencyId: 'dependency3'
    }])).onSecondCall().returns(defer(true, [{
      parentSnapshotId: 'snapshot2',
      childSnapshotId: 'snapshot4',
      rank: 1,
      dependencyId: 'dependency4'
    }, {
      parentSnapshotId: 'snapshot3',
      childSnapshotId: 'snapshot5',
      rank: 1,
      dependencyId: 'dependency5'
    }]))
    const stubChildren = sinon.stub(Registry.AppSnapshot, 'where').returns(defer(true, [{
      workspace: 'name2',
      snapshotId: 'snapshot2',
      appId: 'appId2',
      branchId: 'branchId2',
      appShortName: 'appShortName2',
      snapshotName: 'snapshotName2',
      appName: 'appName2',
      branchName: 'branchName2',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name3',
      snapshotId: 'snapshot3',
      appId: 'appId3',
      branchId: 'branchId3',
      appShortName: 'appShortName3',
      snapshotName: 'snapshotName3',
      appName: 'appName3',
      branchName: 'branchName3',
      isToolkit: true,
      isObjectsProcessed: false
    }])).onSecondCall().returns(defer(true, [{
      workspace: 'name4',
      snapshotId: 'snapshot4',
      appId: 'appId4',
      branchId: 'branchId4',
      appShortName: 'appShortName4',
      snapshotName: 'snapshotName4',
      appName: 'appName4',
      branchName: 'branchName4',
      isToolkit: false,
      isObjectsProcessed: false
    }, {
      workspace: 'name5',
      snapshotId: 'snapshot5',
      appId: 'appId5',
      branchId: 'branchId5',
      appShortName: 'appShortName5',
      snapshotName: 'snapshotName5',
      appName: 'appName5',
      branchName: 'branchName5',
      isToolkit: true,
      isObjectsProcessed: false
    }]))
    expect(stubSnapshots).not.to.have.been.called
    expect(stubDependencies).not.to.have.been.called
    expect(stubChildren).not.to.have.been.called

    const result1 = workspace.getTopLevelNodes()
    expect(result1).to.be.an.instanceOf(Promise)

    return expect(result1).to.eventually.be.fulfilled.then(data1 => {
      expect(stubSnapshots).to.have.been.calledOnce
      expect(stubSnapshots).to.have.been.calledWith('name1', [])
      expect(stubDependencies).to.have.been.calledOnce
      expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot1'])
      expect(stubChildren).to.have.been.calledOnce
      expect(stubChildren).to.have.been.calledWith('name1', {
        snapshotId: ['snapshot2', 'snapshot3']
      })
      expect(data1).to.containSubset({
        level: 1,
        items: [{
          snapshot: {
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
          },
          children: [{
            workspace: 'name2',
            snapshotId: 'snapshot2',
            appId: 'appId2',
            branchId: 'branchId2',
            appShortName: 'appShortName2',
            snapshotName: 'snapshotName2',
            appName: 'appName2',
            branchName: 'branchName2',
            isToolkit: false,
            isObjectsProcessed: false
          }, {
            workspace: 'name3',
            snapshotId: 'snapshot3',
            appId: 'appId3',
            branchId: 'branchId3',
            appShortName: 'appShortName3',
            snapshotName: 'snapshotName3',
            appName: 'appName3',
            branchName: 'branchName3',
            isToolkit: true,
            isObjectsProcessed: false
          }]
        }]
      })
      expect(data1).to.respondTo('getNextLevel')

      const result2 = data1.getNextLevel()
      expect(result2).to.be.an.instanceOf(Promise)

      return expect(result2).to.eventually.be.fulfilled.then(data2 => {
        expect(stubSnapshots).to.have.been.calledTwice
        expect(stubSnapshots).to.have.been.calledWith('name1', ['snapshot1'])
        expect(stubDependencies).to.have.been.calledTwice
        expect(stubDependencies).to.have.been.calledWith('name1', ['snapshot2', 'snapshot3'])
        expect(stubChildren).to.have.been.calledTwice
        expect(stubChildren).to.have.been.calledWith('name1', {
          snapshotId: ['snapshot4', 'snapshot5']
        })

        expect(data2).to.containSubset({
          level: 2,
          items: [{
            snapshot: {
              workspace: 'name2',
              snapshotId: 'snapshot2',
              appId: 'appId2',
              branchId: 'branchId2',
              appShortName: 'appShortName2',
              snapshotName: 'snapshotName2',
              appName: 'appName2',
              branchName: 'branchName2',
              isToolkit: false,
              isObjectsProcessed: false
            },
            children: [{
              workspace: 'name4',
              snapshotId: 'snapshot4',
              appId: 'appId4',
              branchId: 'branchId4',
              appShortName: 'appShortName4',
              snapshotName: 'snapshotName4',
              appName: 'appName4',
              branchName: 'branchName4',
              isToolkit: false,
              isObjectsProcessed: false
            }]
          }, {
            snapshot: {
              workspace: 'name3',
              snapshotId: 'snapshot3',
              appId: 'appId3',
              branchId: 'branchId3',
              appShortName: 'appShortName3',
              snapshotName: 'snapshotName3',
              appName: 'appName3',
              branchName: 'branchName3',
              isToolkit: true,
              isObjectsProcessed: false
            },
            children: [{
              workspace: 'name5',
              snapshotId: 'snapshot5',
              appId: 'appId5',
              branchId: 'branchId5',
              appShortName: 'appShortName5',
              snapshotName: 'snapshotName5',
              appName: 'appName5',
              branchName: 'branchName5',
              isToolkit: true,
              isObjectsProcessed: false
            }]
          }]
        })
        expect(data2).to.respondTo('getNextLevel')

        stubSnapshots.restore()
        stubDependencies.restore()
        stubChildren.restore()
      })
    })
  })
})
