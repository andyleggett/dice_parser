const Stack = require('./stack')
//const Queue = require('./queue')

const {
    map,
    reduce,
    reduced,
    compose,
    curry,
    prop,
    append
} = require('ramda')

const {
    Left,
    Right
} = require('data.either')

const removeOperators = (pred, output, operators) => {
    while (pred(operators)) {
        output = append(Stack.peek(operators), output)
        operators = Stack.pop(operators)
    }

    return {
        output,
        operators
    }
}

const testPrecedence = curry((op, operators) => (op.associativity === 'left' && op.precedence <= Stack.peek(operators).precedence) || (op.precedence < Stack.peek(operators).precedence))

const notOpeningBracket = (operators) => Stack.peek(operators).bracket !== '('

const notEmpty = (operators) => Stack.isEmpty(operators) === false

const shunter = ({
    output,
    operators
}, token) => {
    if (token.type === 'number' || token.type === 'die') {
        return {
            output: append(token, output),
            operators
        }
    } else if (token.type === 'operator') {
        const state = removeOperators(testPrecedence(token), output, operators)
        return {
            output: state.output,
            operators: Stack.push(token, state.operators)
        }

    } else if (token.type === 'bracket') {
        if (token.bracket === '(') {
            return {
                output: output,
                operators: Stack.push(token, operators)
            }
        } else if (token.bracket === ')') {
            const state = removeOperators(notOpeningBracket, output, operators)
            return {
                output: state.output,
                operators: Stack.pop(state.operators)
            }
        }
    }
}

const shuntState = {
    output: [],
    operators: Stack.empty()
}

const appendRemaining = ({
    output,
    operators
}) => removeOperators(notEmpty, output, operators)

//shunt :: Array -> Queue
const shunt = (tokens) => compose(prop('output'), appendRemaining, reduce(shunter, shuntState))(tokens)

//decrementCounter :: Integer -> Integer -> Integer
const decrementCounter = (counter, by) => {
    counter = counter - by

    if (counter < 0) {
        return reduced(counter)
    } else {
        return counter + 1
    }
}

//checkStep :: Integer -> Object -> Integer
const checkStep = (counter, step) => {
    switch (step.type) {
        case 'die':
        case 'number':
            return counter + 1
        case 'operator':
            if (step.arity === 2) {
                return decrementCounter(counter, 2)
            } else if (step.arity === 1) {
                return decrementCounter(counter, 1)
            }
    }
}

//checkExpression :: Array -> Either Array String
const checkExpression = (steps) => reduce(checkStep, 0, steps) === 1 ? Right(steps) : Left('Invalid Expression')

//countBracket :: Object -> Object
const countBracket = (state, step) => ({
    open: state.open + ((step.type === 'bracket' && step.bracket === '(') ? 1 : 0),
    close: state.close + ((step.type === 'bracket' && step.bracket === ')') ? 1 : 0),
})

//hasEqualBrackets:: Object -> Boolean
const hasEqualBrackets = (brackets) => (brackets.open === brackets.close)

//matchBrackets :: Array -> Either Array String
const matchBrackets = (steps) => compose(hasEqualBrackets, reduce(countBracket, {
    open: 0,
    close: 0
}))(steps) ? Right(steps) : Left('Brackets don\'t match')

module.exports = {
    shunt,
    checkExpression,
    matchBrackets
}