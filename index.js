const {many, sequence, or, digits, str, whitespace, optWhitespace, parse, map, skip, fold, lazy} = require('./parser')
const {compose, reject, isNil, prop, init, drop} = require('ramda')

const filterExpression = (item) => (item === '(' || item === ')' || item === undefined)

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

const projectExpression = (exp) => {

     console.log(exp)
     console.log('*********************')

    return {
        parseType: 'expression',
        expression: reject(filterExpression)(exp)
    }
}

const projectBracketExpression = (exp) =>  {   
    
    //console.log(reject(filterExpression)(exp))
    //console.log('*********************')

    return {
        parseType: 'expression',
        expression: reject(filterExpression)(exp)
    }
}

const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), or)([str('+'), str('-'), str('*'), str('/')])

const expression = lazy(() => or([die, num, operator, skip(whitespace), bracketExpression]))

const bracketExpression = compose(map(projectBracketExpression), sequence)([str(')'), many(expression), str('(')])

const expressions = compose(many, or)([skip(whitespace), expression])

//
console.log(compose(reject(isNil), fold, parse)(expressions, ' (2d6 + 2) * 22 +  4d8 - (4000 - 16d100 * 3d8)'))