import { TweenLite, Expo } from 'gsap';

/**
 * スムーススクロールでy座標まで
 * @param y { number }
 */
export const smoothscroll = (y = 0) => {
  if (typeof document !== 'undefined') {
    const HTML = document.getElementsByTagName('html')[0];
    const BODY = document.getElementsByTagName('body')[0];

    TweenLite.to([HTML, BODY], 0.6, {
      scrollTop: y,
      ease: Expo.easeInOut
    });
  }
};
