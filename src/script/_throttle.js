let time = Date.now();

/**
 * throttle
 * @param {Function} func - 実行したい関数
 * @param {number} duration - 間引きしたい時間
 * @returns {Function}
 */
const throttle = (func, duration = 1000 / 60) => {
  return (() => {
    if (time + duration - Date.now() < 0) {
      time = new Date().getTime();
      return func();
    } else () => null;
  })();
};

export default throttle;
