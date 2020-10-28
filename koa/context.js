const proto = {}

function delegateSet(property, name) {
  proto.__defineSetter__(name, function(val) {
    this[property][name] = val
  })
}

function delegateGet(property, name) {
  proto.__defineGetter__(name, function() {
    return this[property][name]
  })
}

const requestGet = ['query']
const requestSet = []

const responseGet = ['body', 'status']
const responseSet = ['body', 'status']

requestGet.forEach(key => {
  delegateGet('request', key)
})

requestSet.forEach(key => {
  delegateSet('request', key)
})

responseGet.forEach(key => {
  delegateGet('response', key)
})

responseSet.forEach(key => {
  delegateSet('response', key)
})

module.exports = proto
