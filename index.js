const {
    many,
    many1,
    sequence,
    sequenceMap,
    anyOf,
    noneOf,
    eof,
    any,
    all,
    choice,
    str,
    regex,
    parse,
    fold,
    map,
    andThen,
    orElse,
    ap,
    chain,
    of ,
    lift2,
    times,
    atMost,
    atLeast,
    between,
    opt,
    skip,
    skipRight,
    sepBy,
    sepBy1
} = require('./parser')

const {
    add,
    compose,
    reject,
    isNil,
    prop,
    init,
    drop,
    map: rMap,
    merge,
    reduce,
    range,
    flatten
} = require('ramda')

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

const projectRerollDie = (die) => {
    console.log('die', die[3])
    return {
        type: 'rerolldie',
        number: Number(die[0]),
        diceType: Number(die[2]),
        reroll: {
            comparator: die[4],
            target: Number(die[5])
        }
    }
}

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
const betweenWhitespace = (parser) => between(opt(whitespace), parser, opt(whitespace))

const die = compose(map(projectDie), betweenWhitespace, sequence)([digits, str('d'), digits])

const keepDie = compose(map(projectKeepDie), betweenWhitespace, sequence)([digits, str('d'), digits, choice([str('kh'), str('kl'), str('k')]), digits])

const dropDie = compose(map(projectDropDie), betweenWhitespace, sequence)([digits, str('d'), digits, choice([str('dh'), str('dl'), str('d')]), digits])

const successDie = compose(map(projectSuccessDie), betweenWhitespace, sequence)([digits, str('d'), digits, choice([str('<='), str('>='), str('<'), str('>'), str('=')]), digits])

const reroll = sequence([choice([str('ro'), str('r')]), opt(choice([str('<='), str('>='), str('<'), str('>')])), opt(digits)])

const rerollDie = compose(map(projectRerollDie), betweenWhitespace, sequence)([digits, str('d'), digits, many(reroll)])

const num = compose(map(projectNumber), betweenWhitespace)(digits)

const operator = compose(map(projectOperator), betweenWhitespace, choice)([str('+'), str('-'), str('*'), str('/')])

const bracket = compose(map(projectBracket), betweenWhitespace, choice)([str('('), str(')')])

const expression = compose(many1, choice)([rerollDie, successDie, dropDie, keepDie, die, num, operator, bracket])


const calculation = compose(fold, parse)(andThen(expression, eof), '  2d10r1r2r3r>4 ')

console.log(calculation.output)
