
const {
    shunt
} = require('./shuntingyard')

const {
    compose
} = require('ramda')

const {
    parse,
    fold
} = require('./parser')

const {
   expression
} = require('./diceparser')

console.time('calc')
const calculation = compose(fold, parse)(expression, '  (2d100kh3r>50 + 10) * 6df ')

if (calculation.success === true){
    console.log(shunt(calculation.output))
}

console.timeEnd('calc')