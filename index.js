
const {
    shunt
} = require('./shuntingyard')

const {
    calculate,
    rollDice
} = require('./dicecalculator')

const {
    compose,
    prop,
    map
} = require('ramda')

const {
    parse,
    fold
} = require('./parser')

const {
   expression
} = require('./diceparser')

const {
   log
} = require('./utils')

console.time('calc')

//TODO: Add Either
console.log(compose(map(compose(calculate, rollDice, shunt)), log, fold, parse)(expression, '  6d10  '))

console.timeEnd('calc')