class Timer {
  constructor(pubsub, id) {
    this.id = id;
    this.value = Math.floor(Math.random() * 10 + 1);
    this.pubsub = pubsub;
  }

  start() {
    setInterval(() => {
      if (this.value === 0) {
        this.value = 10;
      }
      this.pubsub.publish("TIMER", { id: this.id, timer: this.value });
      this.value = this.value - 1;
    }, 1000);
  }

  getValue() {
    return this.value;
  }
}

module.exports = Timer;
