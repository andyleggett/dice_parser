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
    contains
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
const isSuccess = (result) => result instanceof _Success

const isFailure = (result) => result instanceof _Failure

const first = (pair) => pair[0]

const parse = (parser, input) => parser.action(input)

const log = (item) => {
    console.log(item)
    return item
}

const fold = (result) => {
    if (isSuccess(result) === true) {
        return Right(result)
    } else {
        return Left(result.message)
    }
}

const zeroOrMore = (parser, input) => {
    const result = parser.action(input)
    if (isSuccess(result) === true) {
        const nextResult = zeroOrMore(parser, result.remaining)
        return Success(prepend(result.value, nextResult.value), nextResult.remaining)
    } else {
        return Success([], input)
    }
}

//COMBINATORS
const of = (value) => Parser((input) => Success(value, input))

const fail = (message) => Parser((input) => Failure(message))

const orElse = curry((parser1, parser2) => Parser((input) => {
    const result = parser1.action(input)

    if (isSuccess(result) === true) {
        return result
    } else {
        return parser2.action(input)
    }
}))

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
}))

const notFollowedBy = () => {}

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

const many = (parser) => Parser((input) => zeroOrMore(parser, input))

const many1 = (parser) => Parser((input) => {
    const result = parser.action(input)
    if (isSuccess(result) === true) {
        return zeroOrMore(parser, input)
    } else {
        return result
    }
})

const skip = (parser1, parser2) => sequenceMap((x, y) => y, [parser1, parser2])

const skipRight = (parser1, parser2) => sequenceMap((x, y) => x, [parser1, parser2])

const skipMany = () => {}

const between = (parser1, parser2, parser3) => sequenceMap((x, y, z) => y, [parser1, parser2, parser3])

const sepBy1 = (match, sep) => andThen(match, many(skip(sep, match)))

const sepBy = (match, sep) => Parser((input) => {
    const result = sepBy1(match, sep).action(input)

    if (isSuccess(result) === true) {
        return result
    } else {
        return Success([], result.remaining)
    }
})

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

const takeWhile = (pred) => {

}

const lookAhead = (str) => Parser((input) => {
     const test = input.slice(0, str.length)

    if (test === str) {
        return Success('', input)
    } else {
        return Failure('Expected ' + str)
    }
})

const lookAheadP = (parser) => Parser((input) => {
    const result = parser.action(input)

    if (isSuccess(result) === true){
        return Success('', input)
    } else {
        return Failure('Expected parser to work')
    }
})

const lookAheadRegEx = (regex) => {

}

const lazy = (f) => {
    const parser = Parser((input) => {
        parser.action = f().action
        return parser.action(input)
    })

    return parser
}

const label = curry((lbl, parser) => Parser((input) => {

}, lbl))

//PARSERS
const str = (str) => Parser((input) => {
    const test = input.slice(0, str.length)

    if (test === str) {
        return Success(str, input.substr(str.length))
    } else {
        return Failure('Expected ' + str)
    }
})

const regex = (regexp) => Parser((input) => {
    const match = input.match(regexp)

    if (match !== null && (match[0] === input.substr(0, match[0].length))) {
        return Success(match[0], input.substr(match[0].length))
    } else {
        return Failure('Expected a string to match ' + regexp)
    }
})


const satisfy = (pred) => Parser((input) => {
    const test = input.charAt(0)

    if (pred(test) === true) {
        return Success(test, input.substr(1))
    } else {
        return Failure('Expected ')
    }
})

const anyOf = (chars) => compose(choice, listMap(str))(chars)

const noneOf = (chars) => Parser((input) => {

    const test = input.charAt(0)

    if (!contains(test, chars)){
        return Success(test, input.substr(1))
    } else {
        return Failure('Expected none of ' + chars)
    }

})

const eof = Parser((input) => (input === '') ? Success('', '') : Failure('Expected end of input'))

const all = Parser((input) => Success(input, ''))

const any = Parser((input) => Success(input.charAt(0), input.substr(1)))

module.exports = {
    str,
    regex,
    satisfy,
    anyOf,
    noneOf,
    eof,
    all,
    any,
    of,
    fail,
    orElse,
    andThen,
    notFollowedBy,
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
    fold
}