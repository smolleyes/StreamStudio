module.exports =
  meta:
    name: "node"
    author: "Contra"
    version: "0.0.1"
    description: "Node information"

  version: -> @done process.versions
  environment: -> @done process.env.NODE_ENV
  prefix: -> @done process.installPrefix