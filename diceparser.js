const {
    many,
    many1,
    sequence,
    any,
    choice,
    str,
    regex,
    map,
    between,
    opt,
    end,
    andThen,
    setLabel,
    skip
} = require('./parser')

const {
    compose,
    merge
} = require('ramda')

const {
    log
} = require('./utils')

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

const operators = {
    '^': {
        precedence: 4,
        associativity: "right",
        arity: 2
    },
    '/': {
        precedence: 3,
        associativity: "left",
        arity: 2
    },
    '*': {
        precedence: 3,
        associativity: "left",
        arity: 2
    },
    '+': {
        precedence: 2,
        associativity: "left",
        arity: 2
    },
    '-': {
        precedence: 2,
        associativity: "left",
        arity: 2
    }
}

const projectOperator = (op) => merge({
    type: 'operator',
    operation: op
}, operators[op])

const projectBracket = (br) => ({
    type: 'bracket',
    bracket: br
})

const projectWhitespace = (ws) => ({
    type: 'whitespace',
    whitespace: ws
})

const digit = regex(/[0-9]/, 'digit')
const digits = regex(/[0-9]+/, 'digits')
const whitespace = regex(/\s+/, 'whitespace')

const betweenWhitespace = (parser) => between(opt(whitespace), parser, opt(whitespace))

const keep = sequence([choice([str('kh'), str('kl'), str('k')]), digits])

const drop = sequence([choice([str('dh'), str('dl'), str('d')]), digits])

const success = sequence([choice([str('<='), str('>='), str('<'), str('>'), str('=')]), digits])

const reroll = sequence([choice([str('ro'), str('r')]), opt(choice([str('<='), str('>='), str('<'), str('>')])), opt(digits)])

const modifier = choice([keep, drop, success, reroll])

const die = compose(setLabel('die'), map(projectDie), log, betweenWhitespace, sequence)([digits, str('d'), choice([str('f'), digits]), many(modifier)])

const num = compose(setLabel('number'), map(projectNumber), betweenWhitespace)(digits)

const operator = compose(setLabel('operator'), map(projectOperator), betweenWhitespace, choice)([str('+'), str('-'), str('*'), str('/'), str('^')])

const bracket = compose(setLabel('bracket'), map(projectBracket), betweenWhitespace, choice)([str('('), str(')')])

const expression = compose(many, choice)([die, num, operator, bracket])

module.exports = {
    expression
}