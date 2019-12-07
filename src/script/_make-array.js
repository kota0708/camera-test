import { isArray, isNumber } from './_get-type-of';

/**
 * document.querySelectorAllなどで取得したdomをmapとかで回す時に使う
 * @param {object} obj - document.querySelectorAllなどで取得したオブジェクト
 */
export const makeArray = obj => {
  const array = [];
  if (isArray(obj)) {
    return obj;
  } else if (obj && isNumber(obj.length)) {
    // convert nodeList to array
    for (let i = 0, num = obj.length; i < num; i++) {
      array[i] = obj[i];
    }
  } else {
    array.push(obj);
  }
  return array;
};
