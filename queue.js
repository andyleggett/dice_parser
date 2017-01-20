const Stack = require('./stack')

const _Queue = function(item, inbound, outbound) {
    this.head = item
    this.inbound = inbound
    this.outbound = outbound
}

const Queue = (item, queue) => new _Queue(item, queue)

const _Empty = function(){}

const Empty = new _Empty()

const enqueue = function(item, queue){
    if (Stack.isEmpty(queue.outbound)){
        return Queue(queue.head, queue.inbound, Stack.push(value, queue.outbound))
    }

    return Queue(queue.head, Stack.push(value, queue.inbound), queue.outbound)
}

const dequeue = function(queue){
  
}

const peek = function(queue){
    return queue.head
}

const empty = function(){
    return Queue(Empty)
}

const isEmpty = function(stack){
    
}

module.exports = {
    enqueue,
    dequeue,
    peek,
    empty,
    isEmpty
}