const Stack = require('./stack')
const Queue = require('./queue')

const {
    compose,
    reduce,
    unfold,
    merge,
    map,
    curry,
    join
} = require('ramda')

const {
    Left,
    Right
} = require('data.either')

const {
    log
} = require('./utils')

const add = (a, b) => a + b
const subtract = (a, b) => a - b
const multiply = (a, b) => a * b
const divide = (a, b) => a / b
const power = (a, b) => Math.pow(a, b)

const combineTopTwo = (combiner, stack) => {
    const fst = Stack.peek(stack)
    stack = Stack.pop(stack)
    const snd = Stack.peek(stack)
    stack = Stack.pop(stack)

    return Stack.push(combiner(snd, fst), stack)
}

const randomFromRange = (min, max) => min + Math.floor(Math.random() * (max - min))

const calculateStep = (stack, step) => {
    switch (step.type) {
        case 'die':
            return Stack.push(step.total, stack)
        case 'number':
            return Stack.push(step.number, stack)

        case 'operator':
            switch (step.operation) {
                case '+':
                    return combineTopTwo(add, stack)
                case '-':
                    return combineTopTwo(subtract, stack)
                case '*':
                    return combineTopTwo(multiply, stack)
                case '/':
                    return combineTopTwo(divide, stack)
                case '^':
                    return combineTopTwo(power, stack)
            }
    }
}

//calculate :: Queue -> Number
const calculate = compose(Stack.peek, Queue.foldl(calculateStep, Stack.empty()))

const produceRoll = step => n => n > step.number ? false : [randomFromRange(1, step.diceType), n + 1];

const rollDie = (step) => {
    if (step.type === 'die'){
        //TODO: modifiers
        const values = unfold(produceRoll(step), 1)

        return merge(step, {
            values,
            total: reduce(add, 0, values)
        })
    } else {
        return step
    }
}

//rollDice :: Array -> Array
const rollDice = map(rollDie)

const countBracket = (state, step) => ({
    open: state.open + ((step.type === 'bracket' && step.bracket === '(') ? 1 : 0),
    close: state.close + ((step.type === 'bracket' && step.bracket === ')') ? 1 : 0),
})

//hasEqualBrackets:: Object -> Boolean
const hasEqualBrackets = (brackets) => (brackets.open === brackets.close)

//matchBrackets :: Array -> Either Array String
const matchBrackets = (steps) => compose(hasEqualBrackets, log, reduce(countBracket, {open: 0, close: 0}))(steps) ? Right(steps) : Left('Brackets don\'t match')

const pad = (str, padstart, padend) => padstart + str + (padend || padstart)

const printStep = (state, step) => {
    switch (step.type){
        case 'die':
            return state + pad(join(' + ', step.values), ' [ ', ' ] ')
        case 'number':
            return state + pad(step.number, ' ')
        case 'operator':
            return state + pad(step.operation, ' ')
        case 'bracket':
            return state + pad(step.bracket, ' ')
        default:
            return state
    }
}

const print = reduce(printStep, '')

module.exports = {
    calculate,
    rollDice,
    matchBrackets,
    print
}