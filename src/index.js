const Workspace = require('./classes/Workspace')
const db = require('./db')

/**
 *  Entry point for the library
 *  @namespace twx-parser
 */
module.exports = {
  /**
   * Method to get or create a workspace
   * @memberOf twx-parser
   *
   * @param   {string} name Name of the workspace. If a workspace with this name already exists, it is retrieved. Otherwise, a new workspace is created.
   * @param   {string} password Password to open the workspace. If the workspace is new, the given password will be the workspace's password. If the workspace already exists, this password will be compared with the password used to create the workspace
   *
   * @returns {Promise<Workspace|Error>} Promise that will be resolved with a `Workspace` instance, or be rejected with an `Error` instance if any error occurs
   */
  getWorkspace: async (name, password) => {
    name = `${name}.db`
    const workspace = new Workspace(name)
    await db.initialize(name, password)
    return workspace
  }
}
