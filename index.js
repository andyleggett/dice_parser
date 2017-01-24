const {many, many1, sequence, anyOf, str, regex, parse, fold, ignore, map, andThen, orElse, ap, chain, of, lift2, times} = require('./parser')
const {add, compose, reject, isNil, prop, init, drop, map: rMap, merge, reduce, range} = require('ramda')

const log = (item) => {
    console.log(item)
    return item
}

const projectDie = (die) => ({
    type: 'die',
    number: Number(die[0]),
    diceType: Number(die[2])
})

const projectKeepDie = (die) => ({
    type: 'keepdie',
    number: Number(die[0]),
    diceType: Number(die[2]),
    keep: {
        type: (die[3] === 'kl' ? 'lowest' : 'highest'),
        number: Number(die[4])
    }
})

const projectDropDie = (die) => ({
    type: 'dropdie',
    number: Number(die[0]),
    diceType: Number(die[2]),
    drop: {
        type: (die[3] === 'dh' ? 'highest' : 'lowest'),
        number: Number(die[4])
    }
})

const projectSuccessDie = (die) => ({
    type: 'successdie',
    number: Number(die[0]),
    diceType: Number(die[2]),
    success: {
        comparator: die[3],
        target: Number(die[4])
    }
})

const projectRerollDie = (die) => ({
    type: 'rerolldie',
    number: Number(die[0]),
    diceType: Number(die[2]),
    reroll: {
        comparator: die[4],
        target: Number(die[5])
    }
})

const projectNumber = (num) => ({
    type: 'number',
    number: Number(num)
})

const projectOperator = (op) => ({
    type: 'operator',
    operation: op
})

const projectBracket = (br) => ({
    type: 'bracket',
    bracket: br
})

const projectWhitespace = (ws) => ({
    type: 'whitespace',
    whitespace: ws
})

const digit = regex(/[0-9]/)
const digits = regex(/[0-9]+/)
const whitespace = regex(/\s+/)

const die = compose(map(projectDie), sequence)([digits, str('d'), digits])

const keepDie = compose(map(projectKeepDie), map(log), sequence)([digits, str('d'), digits, anyOf([str('kh'), str('kl'), str('k')]), digits])

const dropDie = compose(map(projectDropDie), map(log),sequence)([digits, str('d'), digits, anyOf([str('dh'), str('dl'), str('d')]), digits])

const successDie = compose(map(projectSuccessDie), map(log),sequence)([digits, str('d'), digits, anyOf([str('<='), str('>='), str('<'), str('>'), str('=')]), digits])

const reroll = sequence([anyOf([str('ro'), str('r')]), times(2, anyOf([str('<='), str('>='), str('<'), str('>')])), digits])


const rerollDie = compose(map(projectRerollDie),map(log), sequence)([digits, str('d'), digits, many1(reroll)])

const num = map(projectNumber)(digits)

const operator = compose(map(projectOperator), anyOf)([str('+'), str('-'), str('*'), str('/')])

const bracket = compose(map(projectBracket), anyOf)([str('('), str(')')])

const expression = compose(many, anyOf)([rerollDie, successDie, dropDie, keepDie, die, num, operator, bracket, ignore(whitespace)])

const calculation = compose(fold, parse)(expression, '( 16d100k19 * 4d12dl2   ) - (7d12>=7    +    8d100r50r25r75)')

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

console.log(calculation)