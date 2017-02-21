
const {
    shunt
} = require('./shuntingyard')

const {
    calculate,
    rollDice,
    matchBrackets,
    print
} = require('./dicecalculator')

const {
    compose,
    prop,
    map,
    chain
} = require('ramda')

const {
    Left,
    Right
} = require('data.either')

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

const rolledDice = compose(map(rollDice), chain(matchBrackets), fold, parse(expression))('   100d100 ')

console.log(map(print)(rolledDice))
console.log(compose(map(calculate), map(shunt))(rolledDice))

console.timeEnd('calc')