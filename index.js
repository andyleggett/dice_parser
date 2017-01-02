const {many, sequence, or, digits, str, whitespace, optWhitespace, parse, map, skip, fold, lazy} = require('./parser')
const {compose, reject, isNil, prop, init, drop} = require('ramda')

const projectDie = (die) => ({
    parseType: 'die',
    number: Number(die[0]),
    type: Number(die[2])
})

const projectNumber = (num) => ({
    parseType: 'number',
    number: Number(num)
})

const projectOperator = (op) => ({
    parseType: 'operator',
    type: op
})

const projectExpression = (exp) => ({
    parseType: 'expression',
    expression: exp
})

const projectBracketExpression = (exp) => ({
    parseType: 'expression',
    expression: compose(drop(1), init)(exp)
})

const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), or)([str('+'), str('-'), str('*'), str('/')])

const expression = lazy(() => compose(map(projectExpression), or)([die, num, operator, skip(whitespace), bracketExpression]))

const bracketExpression = compose(map(projectBracketExpression), sequence)([str(')'), many(expression), str('(')])

const expressions = compose(many, or)([skip(whitespace), expression])

//reject(isNil), fold, 
console.log(compose( parse)(expressions, ' (2d6 + 2) * 4'))