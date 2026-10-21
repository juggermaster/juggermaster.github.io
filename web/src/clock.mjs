// Anzeige und Klänge folgen derselben Audio-Zeitbasis; verpasste Takte werden nicht nachgeholt.
export class BeatClock {
  constructor({ now, schedule, tick = () => {}, frame = () => {}, interrupted = () => {} }) {
    Object.assign(this, { now, schedule, tick, frame, interrupted });
    this.active = false;
    this.queue = [];
  }
  start(interval, immediate = false) {
    this.stop();
    this.interval = interval;
    this.active = true;
    this.last = this.now();
    this.next = this.last + (immediate ? 0 : interval);
    this.index = 0;
    this.pump();
    if (this.active) this.timer = setInterval(() => this.pump(), 25);
  }
  pump() {
    if (!this.active) return;
    const now = this.now(), delta = now - this.last;
    this.last = now;
    if (delta > Math.max(.5, this.interval)) {
      while (this.active && this.queue.length && this.queue[0].at <= now) this.tick(this.queue.shift());
      this.stop();
      this.interrupted();
      return;
    }
    this.frame(Math.max(0, delta));
    while (this.active && this.queue.length && this.queue[0].at <= now) this.tick(this.queue.shift());
    while (this.active && this.next < now + .12) {
      const event = { at: this.next, index: ++this.index };
      this.queue.push(event);
      this.schedule(event);
      this.next += this.interval;
    }
  }
  stop() { this.active = false; clearInterval(this.timer); this.timer = null; this.queue = []; }
}
