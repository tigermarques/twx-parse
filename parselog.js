var fs = require('fs')
var array = fs.readFileSync('out.txt').toString().split('\n')
const THRESHOLD = 30
let previous = {
  date: new Date(),
  message: null
}

const result = []

for (const i in array) {
  const current = {
    date: new Date(array[i].substring(0, 24)),
    message: array[i]
  }
  if (current.date - previous.date > THRESHOLD) {
    result.push({
      previous: previous.message,
      current: current.message
    })
  }

  previous = current
}

console.log(JSON.stringify(result, null, 2))
