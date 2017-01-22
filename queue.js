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
        while (!Stack.isEmpty(queue.back)) {
            queue.front = Stack.push(Stack.peek(queue.back), queue.front)
            queue.back = Stack.pop(queue.back)
        }
    }

    return Queue(queue.front, queue.back)
}

module.exports = {
    enqueue,
    dequeue,
    peek,
    empty,
    isEmpty
}