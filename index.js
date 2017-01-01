const {many, seq, or, digits, str, whitespace, parse, orElse, andThen, map} = require('./parser')
const {compose} = require('ramda')

const projectDie = (die) => ({
    number: Number(die[0]),
    type: Number(die[2])
});

const die = compose(map(projectDie), seq)([digits, str('d'), digits])

const final = compose(andThen(die), andThen(whitespace), andThen(die))(whitespace)

console.log(parse(final, '    12d4     18d10'))
