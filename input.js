/*
References:

http://unixpapa.com/js/key.html

https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html
https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceOrientationEventClassRef/DeviceOrientationEvent/DeviceOrientationEvent.html
*/

class Input {
  constructor(isMobile) {
    this.controls = {
      left: false,
      up: false,
      right: false,
      down: false,
      space: false,
      m: false,
      mouseX: 0,
      mouseY: 0,
      mouseDown: false
    };

    this.isMobile = isMobile;

    this.mcontrols = {
      orientation: 0,
      xaccel: 0,
      yaccel: 0,
      zaccel: 0,
      alpha: 0,
      beta: 0,
      gamma: 0,
      tapping: false,
      granted: undefined,
    };

    if (this.isMobile) {
      this.mlisten();
    } else {
      this.listen();
    }
  }

  listen() {
    document.addEventListener('keydown', (key) => {
      if (key.keyCode === 32) this.controls.space = true;
      if (key.keyCode === 37) this.controls.left = true;
      if (key.keyCode === 38) this.controls.up = true;
      if (key.keyCode === 39) this.controls.right = true;
      if (key.keyCode === 40) this.controls.down = true;
      if (key.keyCode === 77) this.controls.m = true;
    });

    document.addEventListener('keyup', (key) => {
      if (key.keyCode === 32) this.controls.space = false;
      if (key.keyCode === 37) this.controls.left = false;
      if (key.keyCode === 38) this.controls.up = false;
      if (key.keyCode === 39) this.controls.right = false;
      if (key.keyCode === 40) this.controls.down = false;
      if (key.keyCode === 77) this.controls.m = false;
    });

    document.addEventListener('mousemove', (event) => {
      if (event.offsetX || event.offsetX === 0) { // IE, Opera 
        this.controls.mouseX = event.offsetX;
        this.controls.mouseY = event.offsetY;
      } else if (event.layerX || event.layerX === 0) { // Chrome, FF, Safari(?)
        this.controls.mouseX = event.layerX;
        this.controls.mouseY = event.layerY;
      }
    });

    document.addEventListener('mousedown', () => {
      this.controls.mouseDown = true;
    });

    document.addEventListener('mouseup', () => {
      this.controls.mouseDown = false;
    });
  }

  mperms() {
    if (window.DeviceMotionEvent !== undefined) {
      if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
        return window.DeviceMotionEvent.requestPermission().then((permissionState) => {
          this.mcontrols.granted = permissionState === 'granted';
          if (permissionState === 'granted') {
            this.mlisten();
          }
        });
      } else {
        this.mcontrols.granted = true;
        this.mlisten();
      }
    } else {
      console.log('DeviceMotionEvent is not supported');
      this.mcontrols.granted = false;
    }
  }

  mlisten() {
    if (window.DeviceMotionEvent !== undefined) {
      window.ondevicemotion = (event) => {
        const { accelerationIncludingGravity, rotationRate } = event;
        this.mcontrols.xaccel = accelerationIncludingGravity.x;
        this.mcontrols.yaccel = accelerationIncludingGravity.y;
        this.mcontrols.zaccel = accelerationIncludingGravity.z;
        this.mcontrols.alpha = rotationRate.alpha;
        this.mcontrols.beta = rotationRate.beta;
        this.mcontrols.gamma = rotationRate.gamma;
      };
    }

    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 0) {
        this.mcontrols.tapping = true;
      }
    });

    document.addEventListener('touchend', (event) => {
      if (event.touches.length === 0) {
        this.mcontrols.tapping = false;
      }
    });

    window.onorientationchange = () => {
      const { orientation } = window;
      if (orientation === 0) {
        this.mcontrols.orientation = 0;
      } else if (orientation === 90) {
        this.mcontrols.orientation = 90;
      } else if (orientation === -90) {
        this.mcontrols.orientation = -90;
      } else if (orientation === 180) {
        this.mcontrols.orientation = 180;
      }
    };

    window.onorientationchange();
  }
}
