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
    //drop,
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
    diceType: die[2],
    modifiers: die[3]
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
const betweenWhitespace = (parser) => between(opt(whitespace), parser, opt(whitespace))

const keep = sequence([choice([str('kh'), str('kl'), str('k')]), digits])

const drop = sequence([choice([str('dh'), str('dl'), str('d')]), digits])

const success = sequence([choice([str('<='), str('>='), str('<'), str('>'), str('=')]), digits])

const reroll = sequence([choice([str('ro'), str('r')]), opt(choice([str('<='), str('>='), str('<'), str('>')])), opt(digits)])

const modifier = choice([keep, drop, success, reroll])

const die = compose(map(projectDie), map(log), betweenWhitespace, sequence)([digits, str('d'), choice([digits, str('f')]), many(modifier)])

const num = compose(map(projectNumber), betweenWhitespace)(digits)

const operator = compose(map(projectOperator), betweenWhitespace, choice)([str('+'), str('-'), str('*'), str('/')])

const bracket = compose(map(projectBracket), betweenWhitespace, choice)([str('('), str(')')])

const expression = compose(many1, choice)([die, num, operator, bracket])

const calculation = compose(fold, parse)(expression, '  2d100kh3r>50 + 6df ')

console.log(calculation)
