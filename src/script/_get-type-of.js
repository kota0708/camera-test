/**
 * undefinedかどうか。
 * @param value
 * @returns {boolean}
 */
export const isUndefined = value => typeof value === 'undefined';
/**
 * nullかどうか
 * @param value
 * @returns {boolean}
 */
export const isNull = value => value === null;
/**
 * nullでもundefinedでもなくセットされてる状態かどうか
 * @param value
 * @returns {boolean}
 */
export const isSet = value => !isNull(value) && !isUndefined(value);
/**
 * DOMElementかどうか
 * @param node
 * @returns {boolean}
 */
export const isDOMElement = node =>
  node.nodeType === 1 || (!isNull(node) && node === node.window);
/**
 * 関数かどうか
 * @param func
 * @returns {boolean}
 */
export const isFunction = func => typeof func === 'function';
/**
 * [Object Object] かどうか
 * @param obj
 * @returns {boolean}
 */
export const isObject = obj => obj === Object(obj);
/**
 * 数字かどうか
 * @param num
 * @returns {boolean}
 */
export const isNumber = num =>
  typeof num === typeof 1 && num !== null && isFinite(num);
/**
 * 正の数かどうか
 * @param num
 * @returns {boolean}
 */
export const isPositiveNumber = num => isNumber(num) && num > 0;
/**
 * 負の数かどうか
 * @param num
 * @returns {boolean}
 */
export const isNegativeNumber = num => isNumber(num) && num < 0;
/**
 * 文字列かどうか
 * @param str
 * @returns {boolean}
 */
export const isString = str => typeof str === 'string' || str instanceof String;
/**
 * 含まれてるかどうか
 * @param str         { string }
 * @param substr      { string }
 * @returns {boolean}
 */
export const isInclude = (str, substr) => str.indexOf(substr) > -1;
/**
 * 純粋なObjectかどうか
 * obj = { hoge: 'hoge' } これならtrue
 * @param obj { object }
 * @returns {boolean}
 */
export const isPlainObject = obj => {
  let result = false;
  if (isSet(obj) && isObject(obj)) {
    result = !isArray(obj) && !isFunction(obj) && !isDOMElement(obj);
  }
  return result;
};
/**
 * 配列かどうか
 * @param array
 * @returns {*}
 */
export const isArray = array => {
  if (Array.isArray) {
    return Array.isArray(array);
  }
  return Object.prototype.toString.call(array) === '[object Array]';
};
