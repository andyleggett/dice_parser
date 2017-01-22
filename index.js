const {many, many1, sequence, or, str, regex, parse, fold, skip, map, andThen, orElse, ap, chain, of} = require('./parser')
const {compose, reject, isNil, prop, init, drop, map: rMap, merge, reduce, range} = require('ramda')

const projectDie = (die) => ({
    type: 'die',
    number: Number(die[0]),
    diceType: Number(die[2])
})

const projectNumber = (num) => ({
    type: 'number',
    number: Number(num)
})

const projectOperator = (op) => ({
    type: 'operator',
    operation: op
})

const projectBracket = (br) => ({
    type: 'bracket',
    bracket: br
})

const projectWhitespace = (ws) => ({
    type: 'whitespace',
    whitespace: ws
})

const digit = regex(/[0-9]/)
const digits = regex(/[0-9]+/)
//const whitespace = regex(/\s+/)

const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), or)([str('+'), str('-'), str('*'), str('/')])

const bracket = compose(map(projectBracket), or)([str('('), str(')')])

const whitespace = regex(/\s+/)

const expression = compose(many1, or)([die, num, operator, bracket, skip(whitespace)])

const calculation = compose(parse)(expression, '( _ 16d100 * 2d12   ) - (7d2     +    8)')


const test = ap(of((x) => +x + 1), digit)

console.log(parse(test, '4'))

const calculateDie = (input) => {
    if (input.type === 'die'){
        return {
            type: 'number',
            number: input.number * (Math.ceil(Math.random() * 5) + 1)
        }
    } else {
        return input
    }
}

const evaluate = (calculation) => {
    const mapDie = rMap(calculateDie)(calculation)
   return mapDie
}

console.log(calculation)