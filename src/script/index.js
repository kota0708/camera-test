import { makeArray } from './_make-array';
// import { TweenMax } from 'gsap';

(() => {
  window.addEventListener('DOMContentLoaded', () => {
    const $$text = document.querySelectorAll('.js-scoll-text');
    const textArr = []; // 要素毎のデータを格納
    let scrollTop; // スクロール値

    makeArray($$text).forEach(r => {
      const obj = {}; // textアニメーションで使うデータを格納

      // 要素のスクロール値を取得
      const rect = r.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const myTop = rect.top + scrollTop;

      // データを格納
      obj['el'] = r;
      obj['top'] = myTop + 100;
      obj['isActive'] = false;

      // データを配列に格納
      textArr.push(obj);

      // 文字を加工する処理
      const text = r.textContent;

      r.innerHTML = null;

      text.split('').forEach(c => {
        r.innerHTML += `<div class="text-splite-wrap"><span class="text-splite">${c}</span></div>`;
      });
    });

    document.addEventListener('scroll', () => {
      let top = document.documentElement.scrollTop || document.body.scrollTop;
      scrollTop = top + window.innerHeight;

      // テキストのアニメーション
      textArr.forEach(obj => {
        if (scrollTop >= obj.top && !obj.isActive) {
          obj.isActive = true;
          const $$texts = obj.el.querySelectorAll('.text-splite');

          // 文字一つ一つにクラスを装着
          makeArray($$texts).forEach((r, i) =>
            window.setTimeout(() => r.classList.add('isActive'), i * 30)
          );
        }
      });
    });
  });
})();
