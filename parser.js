const {reduce, flatten, tail, prepend, curry, compose, apply, repeat} = require('ramda');

//PARSER TYPE
const _Parser = function(action) {
    this.action = action
}

var Parser = (action) => new _Parser(action)

//RESULT TYPES
const _Success = function(value, remaining){
    this.value = value
    this.remaining = remaining
}

const Success = (value, remaining) => new _Success(value, remaining)

const _Failure = function(message){
    this.message = message
}

const Failure = (message) => new _Failure(message)

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
    if (isSuccess(result) === true){
        return {
            success: true,
            output: result.value,
            remaining: result.remaining
        }
    } else {
        return {
            sucess: false,
            error: result.message
        }
    }
}

const mergeResults = compose(flatten, prepend)

//COMBINATORS
const orElse = curry((parser1, parser2) => {
    return Parser((input) => {
        const result = parser1.action(input)

        if (isSuccess(result) === true){
            return result;
        } else {
           return parser2.action(input)
        }
    })
})

const andThen = curry((parser1, parser2) => {
    return Parser((input) => {
        var result1 = parser1.action(input)
        if (isSuccess(result1) === true){
            const result2 = parser2.action(result1.remaining)
            if (isSuccess(result2) === true){
                return Success(mergeResults(result1.value, [result2.value]), result2.remaining)
            } else {
                return result2
            }
        } else {
            return result1
        }
    })
})

const anyOf = (parsers) => {
    return reduce(orElse, parsers[0])(tail(parsers))
}

const sequence = (parsers) => {
    return reduce(andThen, parsers[0])(tail(parsers))
}

const map = curry((f, parser) => {
    return Parser((input) => {
        const result = parser.action(input)

        if (isSuccess(result) === true){
            return Success(f(result.value), result.remaining)
        } else {
            return result
        }
    })
})

const sequenceMap = (parsers, mapper) => {
    return compose(map(apply(mapper)), sequence)(parsers)
}

const lazy = (f) => {
    const parser = Parser((input) => {
        parser.action = f().action
        return parser.action(input)
    })

    return parser;
}

const zeroOrMore = (parser, input) => {
    const result = parser.action(input)
    if (isSuccess(result) === true){
        const nextResult = zeroOrMore(parser, result.remaining)
        return Success(mergeResults([result.value], [nextResult.value]), nextResult.remaining)
    } else {
        return Success([], input)
    }
}

const many = (parser) => {
    return Parser((input) => zeroOrMore(parser, input))
}

const many1 = (parser) => {
    return Parser((input) => {
        const result = parser.action(input)
        if (isSuccess(result) === true){
            return zeroOrMore(parser, input)
        } else {
            return result
        }
    })
}

const ignore = (parser) => {
    return Parser((input) => { 
        const result = parser.action(input)
        if (isSuccess(result) === true){
            return Success([], result.remaining)
        } else {
            return result
        }
    })
}

const of = (value) => {
    return Parser((input) => Success(value, input))
}

const fail = (value) => {
    return Parser((input) => Failure('Expected ' + value))
}

const ap = curry((fP, xP) => {
    return sequenceMap([xP, fP], (f, x) => f(x))
})

const chain = curry((f, parser) => {
    return Parser((input) => {
        const result = parser1.action(input)

        if (isSuccess(result) === true){
            const nextParser = f(result.value)
            return nextParser(result.remaining)
        } else {
            return result
        }
    })
})

const lift2 = curry((f, xP, yP) => {
    return ap(ap(of(f), xP), yP)
})

const skip = (parser1, parser2) => {
    return Parser((input) => {
        const result1 = parser1.action(input)

        if (isSuccess(result1) === true){
            return parser2.action(result1.remaining)
        } else {
            return result1
        }
    })
}

const between = (parser1, parser2, parser3) => sequence([ignore(parser1), parser2, ignore(parser3)])

const sepBy1 = (match, sep) => andThen(match, many(skip(sep, match)))

const sepBy = (match, sep) => {
    return Parser((input) => {
        const result = sepBy1(match, sep).action(input)

        if (isSuccess(result) === true){
            return result
        } else {
            return Success([], result.remaining)
        }
    })
}


const times = (min, max, parser) => {
    return Parser((input) => {
        let times = 0
        let values = []
        let result
        let remaining = input

        while(times < max){
            result = parser.action(remaining)

            if (isSuccess(result) === true){
                values = mergeResults(values, result.value)
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
}

const atMost = (upperlimit, parser) => times(0, upperlimit, parser)

const atLeast = (lowerlimit, parser) => times(lowerlimit, Infinity, parser)

const opt = (parser) => times(0, 1, parser)

//PARSERS
const str = (str) => {
    return Parser((input) => {   
        const test = input.slice(0, str.length)

        if (test === str){
            return Success(str, input.substr(str.length))
        } else {
            return Failure('Expected \'' + str + '\'')
        }
    })
}

const regex = (regexp) => {
    return Parser((input) => {
        const match = input.match(regexp)

        if (match !== null && (match[0] === input.substr(0, match[0].length))){
            return Success(match[0], input.substr(match[0].length))
        } else {
            return Failure('Expected a string to match ' + regexp)
        }
    })
}

const satisfy = (pred) => {
    return Parser((input) => {
        const test = input.slice(0, 0)

        if (pred(test) === true){
            return Success(test, input.substr(1))
        } else {
            return Failure('Expected ')
        }
    })
}

module.exports = {  
    str,
    regex,
    satisfy,
    orElse,
    andThen,
    sequence,
    sequenceMap,
    opt,
    between,
    sepBy,
    sepBy1,
    times,
    atMost,
    atLeast,
    anyOf,
    map,
    many,
    many1,
    ignore,
    lazy,
    skip,
    of,
    fail,
    ap,
    lift2,
    chain,
    parse,
    fold
}