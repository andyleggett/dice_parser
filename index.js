
const {
    shunt,
    matchBrackets,
    checkExpression
} = require('./shuntingyard')

const {
    calculate,
    rollDice,
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

const parsedDice = compose(log, fold, parse(expression))('(10d10 + 4 ) + 4d6')

const rolledDice = map(rollDice)(parsedDice)

const calculatedDice = compose(map(calculate), chain(checkExpression), map(shunt), chain(matchBrackets))(rolledDice)

if (calculatedDice.isRight){
    console.log(map(print)(rolledDice))
}

console.log(calculatedDice)

console.timeEnd('calc')