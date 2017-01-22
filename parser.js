const {reduce, flatten, tail, prepend, curry, compose} = require('ramda');

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

const andThen = curry((parser2, parser1) => {
    return Parser((input) => {
        var result1 = parser1.action(input)

        if (isSuccess(result1) === true){
            const result2 = parser2.action(result1.remaining)

            if (isSuccess(result2) === true){
                return Success(prepend(result1.value, result2.value), result2.remaining)
            } else {
                return result2
            }
        } else {
            return result1
        }
    })
})

const or = (parsers) => {
    return reduce(orElse, parsers[0])(tail(parsers))
}

const sequence = (parsers) => {
    return reduce(andThen, parsers[0])(tail(parsers))
}

const map = curry((f, parser) => {
    return Parser((input) => {
        const result = parser.action(input)

        if (isSuccess(result)){
            return Success(f(result.value), result.remaining)
        } else {
            return result
        }
    })
})

const lazy = (f) => {
    const parser = Parser((input) => {
        parser.action = f().action
        return parser.action(input)
    })

    return parser;
}

const zeroOrMore = (parser, input) => {
    const result = parser.action(input)
    if (isSuccess(result)){
        const nextResult = zeroOrMore(parser, result.remaining)
        return Success(compose(flatten, prepend)(result.value, nextResult.value), nextResult.remaining)
    } else {
        return Success([], input)
    }
}

const many = (parser) => {
    return Parser((input) => {
        return zeroOrMore(parser, input)
    })
}

const many1 = (parser) => {
    return Parser((input) => {
        const result = parser.action(input)
        if (isSuccess(result)){
            return zeroOrMore(parser, input)
        } else {
            return result
        }
    })
}

const skip = (parser) => {
    return Parser((input) => { 
        const result = parser.action(input)
        if (isSuccess(result)){
            return Success([], result.remaining)
        } else {
            return result
        }
    })
}

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

module.exports = {  
    str,
    regex,
    orElse,
    andThen,
    sequence,
    or,
    map,
    many,
    many1,
    skip,
    lazy,
    parse
}