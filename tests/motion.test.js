import test from 'node:test';
import assert from 'node:assert/strict';
import { cancelMotion, playMotion, prefersReducedMotion } from '../src/ui/motion.js';

class MotionElement extends EventTarget {
  classes = new Set();
  get classList() {
    return {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
    };
  }
  emit(type, animationName) {
    const event = new Event(type);
    Object.defineProperties(event, {
      target: { value: this },
      animationName: { value: animationName },
    });
    this.dispatchEvent(event);
  }
}

test('reduced motion preference skips animation and unknown names are rejected', async () => {
  const element = new MotionElement();
  assert.equal(prefersReducedMotion(query => ({ matches: query.includes('reduce') })), true);
  assert.equal(prefersReducedMotion(() => ({ matches: false })), false);
  assert.equal(await playMotion(element, 'card-draw', { reducedMotion: true }), false);
  assert.deepEqual([...element.classes], []);
  assert.throws(() => playMotion(element, 'hidden-outcome'), RangeError);
});

test('motion resolves only for its own animation event and cleans up its class', async () => {
  const element = new MotionElement();
  const motion = playMotion(element, 'dice-roll', { durationMs: 1000 });
  assert.ok(element.classes.has('motion-dice-roll'));
  element.emit('animationend', 'other');
  assert.ok(element.classes.has('motion-dice-roll'));
  element.emit('animationend', 'dice-roll');
  assert.equal(await motion, true);
  assert.deepEqual([...element.classes], []);
});

test('a canceled motion settles once and a later animation can run on the same element', async () => {
  const element = new MotionElement();
  const first = playMotion(element, 'card-draw', { durationMs: 1000 });
  cancelMotion(element);
  assert.equal(await first, false);
  assert.deepEqual([...element.classes], []);
  const second = playMotion(element, 'result-reveal', { durationMs: 1000 });
  element.emit('animationend', 'result-reveal');
  assert.equal(await second, true);
});

test('a missing animationend event falls back to a bounded completion timer', async () => {
  const element = new MotionElement();
  assert.equal(await playMotion(element, 'result-reveal', { durationMs: 1 }), true);
  assert.deepEqual([...element.classes], []);
});
