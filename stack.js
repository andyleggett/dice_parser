const _Stack = function(item, stack) {
    this.head = item
    this.tail = stack
}

const _Empty = function(){}

const Stack = (item, stack) => new _Stack(item, stack)

const Empty = new _Empty()

const push = (item, stack) => {
    return Stack(item, stack)
}

const pop = (stack) => {
   return stack.tail === undefined ?  Stack(Empty) : stack.tail
}

const peek = (stack) => {
    return stack.head
}

const empty = () => {
    return Stack(Empty)
}

const isEmpty = (stack) => {
    return (stack.head === undefined || stack.head instanceof _Empty)
}

const reverse = (stack) => {
    let reverseStack = empty()

    while (!isEmpty(stack)) {
        reverseStack = push(peek(stack), reverseStack)
        stack = pop(stack)
    }

    return reverseStack
}

module.exports = {
    push,
    pop,
    peek,
    empty,
    isEmpty,
    reverse
}