const Queue = require('./queue')

const {
    compose
} = require('ramda')

const calculateStep = (stack, step) => {
    switch (step.type) {
        case 'die':
            stack.push(10)
            break

        case 'number':
            stack.push(step.number)
            break

        case 'operator':

            switch (step.operation) {
                case '+':

                    break
                case '-':

                    break
                case '*':

                    break
                case '/':

                    break
                case '^':

                    break


            }

            break
    }
}

const calculate = (calculationqueue) => compose(Stack.peek, reduce(calculateStep, Stack.empty()))

module.exports = {
    calculate
}