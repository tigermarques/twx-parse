const parser = require('fast-xml-parser')

class XMLWrapper {
  constructor (obj) {
    this.node = obj
  }

  getNode (...args) {

  }

  getValue (...args) {

  }

  getAttribute (attributeName) {

  }

  xPath (path) {

  }
}

XMLWrapper.fromString = (data) => {
  return new XMLWrapper(parser.parse(data, {
    ignoreNameSpace: true,
    ignoreAttributes: false,
    attributeNamePrefix: '$'
  }))
}

module.exports = XMLWrapper
