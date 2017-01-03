const {many, sequence, or, digits, str, whitespace, optWhitespace, parse, map, skip, fold, lazy} = require('./parser')
const {compose, reject, isNil, prop, init, drop, map: rMap, merge} = require('ramda')

const filterExpression = (item) => (item === '(' || item === ')' || item === undefined)

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

const projectBracketExpression = (exp) =>  ({
    type: 'subexpression',
    subexpression: reject(filterExpression)(exp)
})


const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), or)([str('+'), str('-'), str('*'), str('/')])

const expression = lazy(() => or([die, num, operator, skip(whitespace), bracketExpression]))

const bracketExpression = compose(map(projectBracketExpression), sequence)([str(')'), many(expression), str('(')])

const expressions = compose(many, or)([skip(whitespace), expression])

const calculation = compose(reject(isNil), fold, parse)(expressions, ' 4d6 * 100')

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
    console.log('here')
    const mapDie = rMap(calculateDie)(calculation)
   return mapDie
}

console.log(evaluate(calculation))