class Queue {
    constructor() {
      this.items = {};
      this.front = 0;
      this.rear = 0;
    }
    enqueue(item) {
      this.items[this.rear] = item;
      this.rear++;
    }
    dequeue() {
      
      if(this.front==this.rear)throw Error ('Stack is Empty');
      
      const item = this.items[this.front];
      delete this.items[this.front];
      this.front++;
      return item;
    }
    peek() {
      if(this.front==this.rear)throw Error ('Stack is Empty');
      return this.items[this.front];
    }
    length(){
      return (this.rear-this.front);
    }
    isEmpty() {
      return (this.front===this.rear);
    }
  }

  module.exports = Queue;