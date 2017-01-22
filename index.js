const {many, sequence, or, digits, str, whitespace, parse, map, skip, fold, lazy, andThen, orElse} = require('./parser')
const {compose, reject, isNil, prop, init, drop, map: rMap, merge, reduce, range} = require('ramda')
const Stack = require('./stack')
const Queue = require('./queue')

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

//const simple = andThen(digits, whitespace)

//const calculationSimple = parse(simple, '4d6 + 4 ')

let stack = Stack.empty()

stack = Stack.push(5, stack)
stack = Stack.push(10, stack)
stack = Stack.pop(stack)

console.time('queue enqueue')
let queue = reduce((acc, num) => Queue.enqueue(num, acc), Queue.empty())(range(1, 1000000))
console.timeEnd('queue enqueue')

console.time('queue dequeue')
while(!Queue.isEmpty(queue)){
    
    queue = Queue.dequeue(queue)
}
console.timeEnd('queue dequeue')