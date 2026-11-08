const motions = Object.freeze({
  'card-draw': 720,
  'dice-roll': 900,
  'result-reveal': 560,
});
const activeMotions = new WeakMap();

export function prefersReducedMotion(matchMedia = globalThis.matchMedia) {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function finishMotion(element, motion, completed) {
  if (activeMotions.get(element) !== motion) return;
  activeMotions.delete(element);
  clearTimeout(motion.timeout);
  element.removeEventListener('animationend', motion.onEnd);
  element.removeEventListener('animationcancel', motion.onCancel);
  element.classList.remove(motion.className);
  motion.resolve(completed);
}

export function cancelMotion(element) {
  const motion = activeMotions.get(element);
  if (motion) finishMotion(element, motion, false);
}

export function playMotion(element, name, options = {}) {
  const duration = motions[name];
  if (!element || !duration) throw new RangeError(`Neznámá animace: ${name}`);

  const reduced = options.reducedMotion ?? prefersReducedMotion();
  if (reduced) return Promise.resolve(false);

  cancelMotion(element);
  const className = `motion-${name}`;
  return new Promise(resolve => {
    const motion = {
      className,
      resolve,
      timeout: null,
      onEnd: null,
      onCancel: null,
    };
    const finish = completed => finishMotion(element, motion, completed);
    motion.onEnd = event => {
      if (event.target === element && event.animationName === name) finish(true);
    };
    motion.onCancel = event => {
      if (event.target === element && event.animationName === name) finish(false);
    };
    activeMotions.set(element, motion);
    element.addEventListener('animationend', motion.onEnd);
    element.addEventListener('animationcancel', motion.onCancel);
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    motion.timeout = setTimeout(() => finish(true), (options.durationMs ?? duration) + 120);
  });
}
