import EXIF from 'exif-js';
import { createjs } from '@createjs/easeljs/dist/easeljs.min.js';

class Camera {
  constructor() {
    this.$$file = document.getElementById('js-file');
    this.$$canvas = document.getElementById('js-canvas');
    this.$$canvasCopy = document.getElementById('js-copy');

    this.$$buttonCopy = document.getElementById('js-button-coppy');

    this.onInputImage = this.onInputImage.bind(this);
    this.onClickCopy = this.onClickCopy.bind(this);

    this.stage = null;
    this.stageCopy = null;
    this.bitmap = null;

    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.imgWidth = 0;
    this.imgHeight = 0;

    console.log(EXIF);
  }

  init() {
    this.onListener();
  }

  onListener() {
    this.$$file.addEventListener('change', this.onInputImage);
    this.$$buttonCopy.addEventListener('click', this.onClickCopy);
  }

  onInputImage(e) {
    const files = e.target.files[0]; // ファイル情報を取得
    if (!files) {
      return;
    }

    const image = new Image();
    const newImage = new Image();
    const fr = new FileReader();

    fr.readAsDataURL(files); // ファイル情報を読み込む

    fr.onload = evt => {
      image.src = evt.target.result; // base64

      image.onload = () => {
        const arrayBuffer = this.base64ToArrayBuffer(image.src);
        const exif = EXIF.readFromBinaryFile(arrayBuffer);

        // 画像の高さ / 画像の幅
        const imgAspect = image.naturalHeight / image.naturalWidth;

        console.log(exif);

        this.$$canvas.width = 1000;
        this.$$canvas.height = this.$$canvas.width * imgAspect;

        this.canvasWidth = this.$$canvas.width;
        this.canvasHeight = this.$$canvas.height;

        console.log('imgAspect', imgAspect);
        console.log('image.naturalWidth', image.naturalWidth);
        console.log('image.naturalHeight', image.naturalHeight);

        const ctx = this.$$canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, this.canvasWidth, this.canvasHeight);

        newImage.src = this.$$canvas.toDataURL('image/png');

        // ctx.transform(-1, 0, 0, 1, this.$$canvas.width, this.$$canvas.height);
        // ctx.rotate((-90 * Math.PI) / 180);

        newImage.onload = () => {
          this.stage = new createjs.Stage(this.$$canvas);
          this.stageCopy = new createjs.Stage(this.$$canvasCopy);

          console.log(this.stageCopy);

          this.bitmap = new createjs.Bitmap(newImage);

          const x = this.bitmap.getBounds().width / 2;
          const y = this.bitmap.getBounds().height / 2;

          console.log(this.bitmap.getBounds().width);

          this.bitmap.x = x;
          this.bitmap.y = y;
          this.bitmap.regX = x;
          this.bitmap.regY = y;

          // this.bitmap.rotation = 90;

          // const shape = new createjs.Shape();

          // const rect = shape.graphics.drawPolyStar(0, 0, 75, 5, 0.6, -90);

          this.stage.addChild(this.bitmap);
          this.stage.update();
          // this.stageCopy.addChild(this.bitmap);
          // this.stageCopy.update();
        };

        // if (exif && exif.Orientation) {
        //   switch (exif.Orientation) {
        //     case 3:
        //       rotate = 180;
        //       break;
        //     case 6:
        //       rotate = 90;
        //       break;
        //     case 8:
        //       rotate = -90;
        //       break;
        //   }
        // }
      };
    };
  }

  onClickCopy() {
    const image = new Image();

    const ctx = this.$$canvasCopy.getContext('2d');
    const testImage = this.$$canvas.toDataURL('image/png');

    this.$$canvasCopy.width = 400;
    this.$$canvasCopy.height = 400;

    image.src = testImage;

    const parentWidth = this.canvasWidth / 2;
    const parentHeight = this.canvasHeight / 2;

    const childWidth = this.$$canvasCopy.width / 2;
    const childtHeight = this.$$canvasCopy.height / 2;

    ctx.beginPath();
    ctx.arc(childWidth, childtHeight, childWidth, 0, Math.PI * 2, false);
    ctx.clip();

    image.onload = () => {
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
