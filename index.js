const Workspace = require('./src/classes/Workspace')
const db = require('./src/db')

module.exports = {
  getWorkspace: async (name, password) => {
    name = `${name}.db`
    const workspace = new Workspace(name)
    await db.initialize(name, password)
    return workspace
  }
}
