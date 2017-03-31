const qc = require('quick_check')

const {
  join
} = require('ramda')

const {
    of,
    fail,
    parse,
    str,
    regex,
    many1,
    map,
    sepBy1,
    isParser,
    isSuccess,
    isFailure
} = require('../parser')

describe('of', () => {
 it('should create a parser', () => {
    expect((value) => {
        const parser = of(value)
        return isParser(parser)
    }).forAll(qc.any)
  })

  it('should create a parser that succeeds with input value', () => {
    expect((input, value) => {
        const result = of(value).action(input)
        return isSuccess(result) && result.value === value
    }).forAll(qc.string, qc.any)
  })
})

describe('fail', () => {
  it('should create a parser', () => {
    expect((message, label) => {
        const parser = fail(message, label)
        return isParser(parser)
    }).forAll(qc.string, qc.string)
  })

  it('the parser should fail with message and label', () => {
    expect((message, label, input, output) => {
        const parser = fail(message, label)
        const result = parser.action(input)
        return isFailure(result) && result.message === message && result.label === label
    }).forAll(qc.string, qc.string, qc.any, qc.any)
  })
})

describe('map', () => {

 it('should create a parser', () => {
    expect((f) => {
        const parser = map(f, of(undefined))
        return isParser(parser)
    }).forAll(qc.function)
  })

  it('should transform the parser value', () => {
    expect((f, value, input) => {
        const result = parse(map(f, of(value)))(input)
        return result.value === f(value)
    }).forAll(qc.function, qc.any, qc.string)
  })
})

describe('sepBy1', () => {
  const anyChars = map(join(''), many1(regex(/[a-zA-Z0-9]/, 'any ascii characters')))

  it('should produce a list of separated values from a non-empty input', () => {
    expect((list, sep) => {
        const input = list.join(sep)
        const result = parse(sepBy1(anyChars, str(sep)))(input)
        return isSuccess(result) && result.value.length === list.length //TODO check lists
    }).forAll(qc.arrayOf(qc.string.matching(/^[a-zA-Z0-9]+$/), {length: qc.int.between(2, Infinity)}), qc.pick([',', '#', '~', '|', '_', '-']))
  })

  it('should produce a failure on an empty string', () => {
    expect((sep) => {
        const result = parse(sepBy1(anyChars, str(sep)))('')
        return isFailure(result)
    }).forAll(qc.pick([',', '#', '~', '|', '_', '-']))
  })
})


