const {
    flip,
    reduce,
    flatten,
    head,
    tail,
    prepend,
    isEmpty,
    curry,
    compose,
    apply,
    repeat,
    map: listMap,
    contains,
    join
} = require('ramda')

const {
    Left,
    Right
} = require('data.either')

//PARSER TYPE
const _Parser = function (action, label) {
    this.action = action
    this.label = label
}

const Parser = (action, label) => new _Parser(action, label)

//RESULT TYPES
const _Success = function (value, remaining) {
    this.value = value
    this.remaining = remaining
}

const Success = (value, remaining) => new _Success(value, remaining)

const _Failure = function (message, label) {
    this.message = message
    this.label = label
}

const Failure = (message, label) => new _Failure(message, label)

//HELPERS
const isParser = (parser) => parser instanceof _Parser

const isSuccess = (result) => result instanceof _Success

const isFailure = (result) => result instanceof _Failure

const parse = curry((parser, input) => parser.action(input))

const fold = (result) => (isSuccess(result) === true) ? (result.remaining === '' ? Right(result.value) : Left('Input remaining')) : Left(`${result.message}. Expected ${result.label}.` )

//COMBINATORS
const of = (value) => Parser((input) => Success(value, input))

const fail = (message, label) => Parser((input) => Failure(message, label))

const orElse = curry((parser1, parser2) => Parser((input) => {
    const result = parser1.action(input)

    if (isSuccess(result) === true) {
        return result
    } else {
        return parser2.action(input)
    }
}, `${getLabel(parser1)} orElse ${getLabel(parser2)}`))

const andThen = curry((parser1, parser2) => Parser((input) => {
    const result1 = parser1.action(input)

    if (isSuccess(result1) === true) {
        const result2 = parser2.action(result1.remaining)
        if (isSuccess(result2) === true) {
            return Success([result1.value, result2.value], result2.remaining)
        } else {
            return result2
        }
    } else {
        return result1
    }
}, `${getLabel(parser1)} andThen ${getLabel(parser2)}`))

const choice = (parsers) => reduce(orElse, head(parsers))(tail(parsers))

const map = curry((f, parser) => Parser((input) => {
    const result = parser.action(input)

    if (isSuccess(result) === true) {
        return Success(f(result.value), result.remaining)
    } else {
        return result
    }
}))

const ap = curry((fP, xP) => compose(map(([f, x]) => f(x)), andThen)(fP, xP))

const apRev = flip(ap)

const lift2 = curry((f, xP, yP) => compose(apRev(yP), apRev(xP), of)(f))

const chain = curry((f, parser) => Parser((input) => {
    const result = parser.action(input)

    if (isSuccess(result) === true) {
        const nextParser = f(result.value)
        return nextParser.action(result.remaining)
    } else {
        return result
    }
}))

const consP = lift2(prepend)

const sequence = (parsers) => {
    if (isEmpty(parsers) === true){
        return of([])
    } else {
        return consP(head(parsers), sequence(tail(parsers)))
    }
}

const sequenceMap = curry((maps, parsers) => compose(map(apply(maps)), sequence)(parsers))

const zeroOrMore = (parser, input) => {
    const result = parser.action(input)
    if (isSuccess(result) === true) {
        const nextResult = zeroOrMore(parser, result.remaining)
        return Success(prepend(result.value, nextResult.value), nextResult.remaining)
    } else {
        return Success([], input)
    }
}

const many = (parser) => Parser((input) => zeroOrMore(parser, input), `many ${getLabel(parser)}`)

const many1 = (parser) => Parser((input) => {
    const result = parser.action(input)
    if (isSuccess(result) === true) {
        return zeroOrMore(parser, input)
    } else {
        return result
    }
}, `many1 ${getLabel(parser)}`)

const skip = (parser1, parser2) => sequenceMap((x, y) => y, [parser1, parser2])

const skipRight = (parser1, parser2) => sequenceMap((x, y) => x, [parser1, parser2])

const skipMany = () => {}

const between = (parser1, parser2, parser3) => sequenceMap((x, y, z) => y, [parser1, parser2, parser3])

const sepBy1 = (match, sep) => map(flatten)(andThen(match, many(skip(sep, match))))

const sepBy = (match, sep) => Parser((input) => {
    const result = sepBy1(match, sep).action(input)

    if (isSuccess(result) === true) {
        return result
    } else {
        return Success([], result.remaining)
    }
}, sep)

const times = (min, max, parser) => Parser((input) => {
    let times = 0
    let values = []
    let result
    let remaining = input

    while (times < max) {
        result = parser.action(remaining)

        if (isSuccess(result) === true) {
            values = prepend(result.value, values)
            remaining = result.remaining
            times += 1
        } else if (times >= min) {
            break
        } else {
            return result
        }
    }

    return Success(values, remaining)
})

const atMost = (upperlimit, parser) => times(0, upperlimit, parser)

const atLeast = (lowerlimit, parser) => times(lowerlimit, Infinity, parser)

const opt = (parser) => times(0, 1, parser)

const lazy = (f) => {
    const parser = Parser((input) => {
        parser.action = f().action
        return parser.action(input)
    })

    return parser
}

const getLabel = (parser) => parser.label

const setLabel = curry((label, parser) => Parser((input) => {
    const result = parser.action(input)

    if (isSuccess(result) === true){
        return result
    } else {
        return Failure(result.message, label)
    }
}, label))

//PARSERS
const str = (str) => Parser((input) => {
    const test = input.slice(0, str.length)

    if (test === str) {
        return Success(str, input.substr(str.length))
    } else {
        return Failure('Unexpected ' + test, str)
    }
}, str)

const regex = (regexp, label) => Parser((input) => {
    const match = input.match(regexp)

    if (match !== null && (match[0] === input.substr(0, match[0].length))) {
        return Success(match[0], input.substr(match[0].length))
    } else {
        return Failure('Unexpected string from ' + regexp.source, label)
    }
}, label)

const satisfy = (pred, label) => Parser((input) => {
    const test = input.charAt(0)

    if (pred(test) === true) {
        return Success(test, input.substr(1))
    } else {
        return Failure('Unexpected ' + test, label)
    }
})

const anyOf = (chars) => compose(choice, setLabel('any of'), listMap(str))(chars)

const noneOf = (chars) => Parser((input) => {

    const test = input.charAt(0)

    if (!contains(test, chars)){
        return Success(test, input.substr(1))
    } else {
        return Failure('Unexpected ' + test, `one of ${join(',', chars)}`)
    }
})

const end = Parser((input) => (input === '') ? Success('', '') : Failure('Unexpected ' + input, 'end of input'))

const all = Parser((input) => Success(input, ''))

const any = Parser((input) => Success(input.charAt(0), input.substr(1)))

const lookAhead = (str) => Parser((input) => {
    const test = input.slice(0, str.length)

    if (test === str) {
        return Success('', input)
    } else {
        return Failure('Unexpected ' + text, str)
    }
})

const lookAheadP = (parser) => Parser((input) => {
    const result = parser.action(input)

    if (isSuccess(result) === true){
        return Success('', input)
    } else {
        return Failure('Unexpected failure of lookahead', getLabel(parser))
    }
})

const lookAheadRegEx = (regex, label) => {
 const match = input.match(regexp)

    if (match !== null && (match[0] === input.substr(0, match[0].length))) {
        return Success('', input)
    } else {
        return Failure('Unexpected string from ' + regex.toString(), label)
    }
}

module.exports = {
    str,
    regex,
    satisfy,
    anyOf,
    noneOf,
    end,
    all,
    any,
    of,
    fail,
    orElse,
    andThen,
    choice,
    sequence,
    sequenceMap,
    opt,
    between,
    sepBy,
    sepBy1,
    times,
    atMost,
    atLeast,
    map,
    many,
    many1,
    lazy,
    skip,
    skipRight,
    skipMany,
    lookAhead,
    lookAheadP,
    lookAheadRegEx,
    ap,
    lift2,
    chain,
    parse,
    fold,
    getLabel,
    setLabel,
    isParser,
    isSuccess,
    isFailure
}