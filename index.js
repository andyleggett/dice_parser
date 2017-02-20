
const {
    shunt
} = require('./shuntingyard')

const {
    calculate
} = require('./dicecalculator')

const {
    compose,
    prop
} = require('ramda')

const {
    parse,
    fold
} = require('./parser')

const {
   expression
} = require('./diceparser')

console.time('calc')

//TODO: Add Either
console.log(compose(calculate, shunt, prop('output'), fold, parse)(expression, '  (2d100kh3r>50 + 10) * 6df '))

console.timeEnd('calc')