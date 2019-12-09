import EXIF from 'exif-js';
import { createjs } from '@createjs/easeljs/dist/easeljs.min.js';
import Hammer from 'hammerjs';

const minScall = 0.999; // 拡大の最低
const maxScall = 4; // 拡大の最大
const maxWidth = 500; // メインのcanvasの横サイズ

// コピーcanvasの幅と高さ(APIに送る画像幅と高さになる)
const copyWidth = 500;
const copyHeight = 500;

class Camera {
  constructor() {
    this.$$file = document.getElementById('js-file');
    this.$$canvas = document.getElementById('js-canvas');
    this.$$canvasCopy = document.getElementById('js-copy');
    this.$$refresh = document.getElementById('js-refresh');

    this.$$buttonCopy = document.getElementById('js-button-coppy');

    this.stage = null; // メインのステージ
    this.stageCopy = null; // コピー用のステージ
    this.bitmap = null; // メインのステージの画像
    this.mainImage = null; // メインの画像を入れる箱

    this.canvasWidth = 0; // メインのcanvasのwidth
    this.canvasHeight = 0; // メインのステージheight
    this.imgWidth = 0;
    this.imgHeight = 0;

    this.startX = 0; // Panの開始x
    this.startY = 0; // Panの開始y

    this.scall = 1; // Pinchの開始scall

    this.isStartPan = false; // pan中かどうか
    this.isStartPinch = false; // Pinch中かどうか

    this.mc = new Hammer(this.$$canvas);

    this.getImage = null; // リサイズした画像を入れる箱

    this.timerPinch = -1; // Pinchのtimer
    this.timerPen = -1; // Penのtimer

    // bind系
    this.onInputImage = this.onInputImage.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);
  }

  init() {
    this.onListener();
    this.mc.get('pinch').set({ enable: true });
    this.mc.get('pan').set({ threshold: 1 });
  }

  onListener() {
    this.$$file.addEventListener('change', this.onInputImage);
    this.$$buttonCopy.addEventListener('click', this.onClickCopy);
    this.$$refresh.addEventListener('click', () => {
      this.onRefresh(this.$$canvas);
    });

    this.mc.on('pan pinch', e => {
      this.onPith(e);
      this.onPan(e);
    });
  }

  /**
   * ピンチイン、アウトの処理
   * @param {Event} e Hummer.jsのイベント
   */
  onPith(e) {
    // typeがpinchかつpanが動作してない場合
    if (e.type === 'pinch' && !this.isStartPan) {
      window.clearTimeout(this.timerPinch);

      if (!this.isStartPinch) {
        this.isStartPinch = !this.isStartPinch;
      }

      // 0.999 ~ 4までスケール
      const scale = Math.max(
        minScall,
        Math.min(this.scall * e.scale, maxScall)
      );

      // 画像を拡大
      this.bitmap.scaleX = scale;
      this.bitmap.scaleY = scale;

      // ある程度時間がたったらpinchを終了
      this.timerPinch = window.setTimeout(() => {
        this.scall = scale;
        this.isStartPinch = false;
      }, 300);

      this.stage.addChild(this.bitmap);
      this.stage.update();
    }
  }

  /**
   * ドラッグ操作の処理
   * @param {Event} e Hummer.jsのイベント
   */
  onPan(e) {
    // typeがpenかつpinchが動作してない場合
    if (e.type === 'pan' && !this.isStartPinch) {
      // 初回のみ
      if (!this.isStartPan) {
        // 前回やった画像の位置を格納
        this.startX = this.bitmap.x;
        this.startY = this.bitmap.y;

        this.isStartPan = true;
      }

      window.clearTimeout(this.timerPen);

      let dx; // 画像の移動値x
      let dy; // 画像の移動値y

      // 画像の移動を制限
      // const getlimitX = this.canvasWidth;
      // const getlimitY = this.canvasHeight;
      // const isPlus = num => !!(Math.sign(num) === 1);

      // if (
      //   (this.startX + e.deltaX > getlimitX && isPlus(e.deltaX)) ||
      //   (this.startX - e.deltaX < 0 && !isPlus(e.deltaX))
      // ) {
      //   return;
      // } else {
      //   dx = this.startX + e.deltaX;
      // }

      // if (
      //   (this.startY + e.deltaY > getlimitY && isPlus(e.deltaY)) ||
      //   (this.startY - e.deltaY < 0 && !isPlus(e.deltaY))
      // ) {
      //   return;
      // } else {
      //   dy = this.startY + e.deltaY;
      // }

      dx = this.startX + e.deltaX; // 開始位置 + penの移動値x
      dy = this.startY + e.deltaY; // 開始位置 + penの移動値y

      this.bitmap.x = dx;
      this.bitmap.y = dy;

      // ドラッグ操作が終わったら伝達する
      if (e.isFinal) {
        this.isStartPan = false;
      }

      // ある程度時間がたったらPanを終了
      this.timerPen = window.setTimeout(() => {
        this.isStartPan = false;
      }, 300);

      this.stage.addChild(this.bitmap);
      this.stage.update();
    }
  }

  /**
   * ファイルで取得した画像を扱う処理
   * @param {Event} e ファイルで取得したデータ
   */
  onInputImage(e) {
    const files = e.target.files[0]; // ファイル情報を取得

    // 何もファイルを選択されてない場合は返す
    if (!files) {
      return;
    }

    // 画像以外は受け付けない
    if (!files.name.match(/.(jpg|jpeg|png)$/i)) {
      alert('画像以外入れてんじゃねー');
      return;
    }

    // ファイル容量が2MB以上に場合はアラート
    if (files.size > 2000000) {
      alert('2MB以上はダメだよー');
      return;
    }

    const fileImage = new Image(); // fileで読み込んだ画像
    const getImage = new Image(); // サイズを加工した画像
    const fr = new FileReader();

    this.mainImage = fileImage;

    fr.readAsDataURL(files); // ファイル情報を読み込む

    fr.onload = evt => {
      fileImage.src = evt.target.result; // base64

      fileImage.onload = () => {
        // 画像の高さ / 画像の幅
        const imgAspect = fileImage.naturalHeight / fileImage.naturalWidth;

        this.$$canvas.width = maxWidth; // メインcanvasの幅

        // メインcanvasの幅によってのアスペクト非を保った画像幅
        this.$$canvas.height = this.$$canvas.width * imgAspect;

        // メインcanvasの幅、高さをキャッシュ
        this.canvasWidth = this.$$canvas.width;
        this.canvasHeight = this.$$canvas.height;

        // 一旦画像をcanvasに書き出す
        // この工程によってバカでかい画像が来ても対応出来る
        const ctx = this.$$canvas.getContext('2d');
        ctx.drawImage(fileImage, 0, 0, this.canvasWidth, this.canvasHeight);

        // canvasに書き出した画像をまたbase64化させる。
        getImage.src = this.$$canvas.toDataURL('image/png');

        getImage.onload = () => {
          this.stage = new createjs.Stage(this.$$canvas); // メインcanvasのstage

          this.bitmap = new createjs.Bitmap(getImage); // メインのcanvasに画像を書き出す

          const x = this.bitmap.getBounds().width / 2;
          const y = this.bitmap.getBounds().height / 2;

          // 書き出した画像の集点を中心にする
          this.bitmap.x = x;
          this.bitmap.y = y;
          this.bitmap.regX = x;
          this.bitmap.regY = y;

          // Exifを確認する処理
          const arrayBuffer = this.base64ToArrayBuffer(fileImage.src);
          const exif = EXIF.readFromBinaryFile(arrayBuffer);

          if (exif && exif.Orientation) {
            switch (exif.Orientation) {
              case 3:
                this.bitmap.rotation = 180;
                break;
              case 6:
                this.bitmap.rotation = 90;
                break;
              case 8:
                this.bitmap.rotation = -90;
                break;
              default:
                this.bitmap.rotation = 0;
            }
          }

          this.stage.addChild(this.bitmap);
          this.stage.update();
        };
      };
    };
  }

  createImage(image) {
    // 画像の高さ / 画像の幅
    const imgAspect = image.naturalHeight / image.naturalWidth;

    this.$$canvas.width = maxWidth; // メインcanvasの幅

    // メインcanvasの幅によってのアスペクト非を保った画像幅
    this.$$canvas.height = this.$$canvas.width * imgAspect;

    // メインcanvasの幅、高さをキャッシュ
    this.canvasWidth = this.$$canvas.width;
    this.canvasHeight = this.$$canvas.height;

    // 一旦画像をcanvasに書き出す
    // この工程によってバカでかい画像が来ても対応出来る
    const ctx = this.$$canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, this.canvasWidth, this.canvasHeight);

    if (this.getImage === null) {
      this.getImage = new Image(); // サイズを加工した画像
    }

    // canvasに書き出した画像をまたbase64化させる。
    this.getImage.src = this.$$canvas.toDataURL('image/png');

    this.getImage.onload = () => {
      if (this.stage === null) {
        this.stage = new createjs.Stage(this.$$canvas); // メインcanvasのstage
      }

      this.bitmap = new createjs.Bitmap(this.getImage); // メインのcanvasに画像を書き出す

      const x = this.canvasWidth / 2;
      const y = this.canvasHeight / 2;

      // 書き出した画像の集点を中心にする
      this.bitmap.x = x;
      this.bitmap.y = y;
      this.bitmap.regX = x;
      this.bitmap.regY = y;

      // Exifを確認する処理
      const arrayBuffer = this.base64ToArrayBuffer(fileImage.src);
      const exif = EXIF.readFromBinaryFile(arrayBuffer);

      if (exif && exif.Orientation) {
        switch (exif.Orientation) {
          case 3:
            this.bitmap.rotation = 180;
            break;
          case 6:
            this.bitmap.rotation = 90;
            break;
          case 8:
            this.bitmap.rotation = -90;
            break;
          default:
            this.bitmap.rotation = 0;
        }
      }

      this.stage.addChild(this.bitmap);
      this.stage.update();
    };
  }

  /**
   * 書き出した画像を加工する処理
   */
  onClickCopy() {
    // メインのcanvasが何も選択されてない場合は返す
    if (this.stage === null) {
      alert('画像を選択してからコピってねー');
      return;
    }

    this.stageCopy = new createjs.Stage(this.$$canvasCopy); // コピー用のcanvasのstage

    const image = new Image(); // メインのcanvasを画像を格納する箱

    const ctx = this.$$canvasCopy.getContext('2d');
    const copyImage = this.$$canvas.toDataURL('image/png');

    // コピーcanvasの幅 + 高さをキャッシュさせる
    this.$$canvasCopy.width = copyWidth;
    this.$$canvasCopy.height = copyHeight;

    image.src = copyImage; // メインcanvasから持ってきた画像を読み込む

    // メインのcanvasの画像幅 or 高さ / 2
    const parentWidth = this.canvasWidth / 2;
    const parentHeight = this.canvasHeight / 2;

    // コピーのcanvasの画像幅 or 高さ / 2
    const childWidth = this.$$canvasCopy.width / 2;
    const childtHeight = this.$$canvasCopy.height / 2;

    // 丸くくり抜く処理
    ctx.beginPath();
    ctx.arc(childWidth, childtHeight, childWidth, 0, Math.PI * 2, false);
    ctx.clip();

    image.onload = () => {
      // メインのcanvasからコピーしてくる(コピーcanvasの幅 + 高さの真ん中のみ)
      ctx.drawImage(
        image,
        parentWidth - childWidth,
        parentHeight - childtHeight,
        this.$$canvasCopy.width,
        this.$$canvasCopy.height,
        0,
        0,
        this.$$canvasCopy.width,
        this.$$canvasCopy.height
      );
    };
  }

  // canvasをリフレッシュ
  onRefresh(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  base64ToArrayBuffer(base64) {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gim, '');
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

const camera = new Camera();
camera.init();
