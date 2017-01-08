const {many, sequence, or, digits, str, whitespace, parse, map, skip, fold, lazy, andThen, orElse} = require('./parser')
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

const projectExpression = (exp) =>  ({
    type: 'expression',
    expression: exp
})


const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), or)([str('+'), str('-'), str('*'), str('/')])

const expression = lazy(() =>  or([die, num, operator, bracketExpression, whitespace]))

const bracketExpression = compose(map(projectExpression), sequence)([str(')'), many(expression), str('(')])

const expressions = compose(many, or)([whitespace, expression])

//const calculation = parse(expressions, ' 4d6 * 100 * (2d6 + 8)')

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

//console.log(calculation)

const simple = andThen(digits, whitespace)

const calculationSimple = parse(simple, '4d6 + 4 ')