const Stack = require('./stack')
const Queue = require('./queue')

const {
    compose, 
    reduce,
    unfold,
    merge
} = require('ramda')

const add = (a, b) => b + a
const subtract = (a, b) => b - a
const multiply = (a, b) => b * a
const divide = (a, b) => b / a
const power = (a, b) => Math.pow(b, a)

const combine = (combiner, stack) => {
    const fst = Stack.peek(stack)
    stack = Stack.pop(stack)
    const snd = Stack.peek(stack)
    stack = Stack.pop(stack)

    return Stack.push(combiner(fst, snd), stack)
}

const randomFromRange = (min, max) => min + Math.floor(Math.random() * (max - min))

const calculateStep = (stack, step) => {
    switch (step.type) {
        case 'die':
        console.log(step.values)
        console.log(step.total)
            return Stack.push(step.total, stack)

        case 'number':
            return Stack.push(step.number, stack)

        case 'operator':
            switch (step.operation) {
                case '+':
                    return combine(add, stack)
                case '-':
                    return combine(subtract, stack)
                case '*':
                    return combine(multiply, stack)
                case '/':
                    return combine(divide, stack)
                case '^':
                    return combine(power, stack)
            }
    }
}

const calculate = (calculationqueue) => compose(Stack.peek, Queue.foldl)(calculateStep, Stack.empty(), calculationqueue)

const f = step => n => n > step.number ? false : [randomFromRange(1, step.diceType), n + 1];

const rollDie = (step) => {
    if (step.type === 'die'){
        const values = unfold(f(step), 1)

        return merge(step, {
            values,
            total: reduce(add, 0, values) 
        })
    } else {
        return step
    }
}
const rollDice = (calculationqueue) => Queue.map(rollDie, calculationqueue)

module.exports = {
    calculate,
    rollDice
}