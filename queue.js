const Stack = require('./stack')

const _Queue = function (front, back) {
    this.front = front
    this.back = back
}

const Queue = (front, back) => new _Queue(front, back)

const _Empty = function () {}

const Empty = new _Empty()

const enqueue = function (value, queue) {
    return Queue(queue.front, Stack.push(value, queue.back))
}

const dequeue = function (queue) {
    queue = swapStacks(queue)

    queue.front = Stack.pop(queue.front)

    return Queue(queue.front, queue.back)
}

const peek = function (queue) {
    queue = swapStacks(queue)

    return queue.front.head
}

const empty = function () {
    return Queue(Stack.empty(), Stack.empty())
}

const isEmpty = function (queue) {
    return Stack.isEmpty(queue.front) && Stack.isEmpty(queue.back)
}

const swapStacks = (queue) => {
      if (isEmpty(queue)) {
        return empty()
    }

    if (Stack.isEmpty(queue.front)) {
        queue.front = Stack.reverse(queue.back)
        queue.back = Stack.empty()
    }

    return Queue(queue.front, queue.back)
}

const toArray = (queue) => {
    const output = []

    while (isEmpty(queue) === false){
        output.push(peek(queue))
        queue = dequeue(queue)
    }

    return output
}

const foldl = (step, initial, queue) => {
    if (isEmpty(queue)){
        return initial
    } else {
        return foldl(step, step(initial, peek(queue)), dequeue(queue))
    }
}

const map = (f, queue) => {
    let newQueue = empty()
    while (isEmpty(queue) === false){
        newQueue = enqueue(f(peek(queue)), newQueue)
        queue = dequeue(queue)
    }

    return newQueue
}

module.exports = {
    enqueue,
    dequeue,
    peek,
    empty,
    isEmpty,
    toArray, 
    foldl,
    map
}