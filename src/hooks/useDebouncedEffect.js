import { useEffect, useRef } from 'react';

/**
 * A custom hook that delays running an effect until a dependency has stopped changing for a specified time.
 * @param {() => void} effect The effect to run.
 * @param {any[]} deps The dependencies to watch.
 * @param {number} delay The delay in milliseconds.
 */
export const useDebouncedEffect = (effect, deps, delay) => {
  const callback = useRef(effect);

  // Update the callback if it changes
  useEffect(() => {
    callback.current = effect;
  }, [effect]);

  useEffect(() => {
    const handler = setTimeout(() => {
      callback.current();
    }, delay);

    // Clean up the timeout on every render
    return () => {
      clearTimeout(handler);
    };
  }, [...deps, delay]); // Re-run if dependencies or delay change
};