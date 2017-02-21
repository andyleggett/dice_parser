const Stack = require('./stack')
const Queue = require('./queue')

const {
    map,
    reduce,
    identity,
    compose,
    curry,
    prop
} = require('ramda')

const removeOperators = (pred, output, operators) => {
     while(pred(operators)){
        output = Queue.enqueue(Stack.peek(operators), output)
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

const shunter = ({output, operators}, token) => {
    if (token.type === 'number' || token.type === 'die'){
         return {
            output: Queue.enqueue(token, output),
            operators
        }
    } else if (token.type === 'operator'){
        const state = removeOperators(testPrecedence(token), output, operators)
        return {
            output: state.output,
            operators: Stack.push(token, state.operators)
        }

    } else if (token.type === 'bracket'){
        if (token.bracket === '('){
            return {
                output: output,
                operators: Stack.push(token, operators)
            }
        } else if (token.bracket === ')'){
            const state = removeOperators(notOpeningBracket, output, operators)
            return {
                output: state.output,
                operators: Stack.pop(state.operators)
            }
        }
    }
}

const shuntState = {
    output: Queue.empty(),
    operators: Stack.empty()
}

const appendRemaining = ({output, operators}) => removeOperators(notEmpty, output, operators)

const shunt = (tokens) =>  compose(prop('output'), appendRemaining, reduce(shunter, shuntState))(tokens)

module.exports = {
    shunt
}