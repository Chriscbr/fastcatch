/*
References:

http://unixpapa.com/js/key.html

https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html
https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceOrientationEventClassRef/DeviceOrientationEvent/DeviceOrientationEvent.html
*/

function Input() {

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

  this.listen();

  this.isMobile = navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i) !== null;

  this.mcontrols = {
    orientation: 0, // orientation of the device
    xaccel: 0, // x acceleration (in the plane of the screen, positive towards the right side of the screen)
    yaccel: 0, // y acceleration (in the plane of the screen, positive towards the top of the screen)
    zaccel: 0, // z accelaration (perpendicular to the screen, positive out of the screen)
    alpha: 0, // rotation, in degrees, of the device frame around its z-axis.
    beta: 0, // rotation, in degrees, of the device frame around its x-axis.
    gamma: 0, // rotation, in degrees, of the device frame around its y-axis
    tapping: false
  };

  if (this.isMobile) {
    this.mlisten();
  }

}

// Adds event listeners for desktop controls
Input.prototype.listen = function () {

  var self = this;

  document.addEventListener("keydown", function (key) {
    if (key.keyCode === 32) {
      self.controls.space = true;
    }
    if (key.keyCode === 37) {
      self.controls.left = true;
    }
    if (key.keyCode === 38) {
      self.controls.up = true;
    }
    if (key.keyCode === 39) {
      self.controls.right = true;
    }
    if (key.keyCode === 40) {
      self.controls.down = true;
    }
    if (key.keyCode === 77) {
      self.controls.m = true;
    }
  }, false);

  document.addEventListener("keyup", function (key) {
    if (key.keyCode === 32) {
      self.controls.space = false;
    }
    if (key.keyCode === 37) {
      self.controls.left = false;
    }
    if (key.keyCode === 38) {
      self.controls.up = false;
    }
    if (key.keyCode === 39) {
      self.controls.right = false;
    }
    if (key.keyCode === 40) {
      self.controls.down = false;
    }
    if (key.keyCode === 77) {
      self.controls.m = false;
    }
  }, false);

  document.addEventListener("mousemove", function (event) {
    if (event.offsetX || event.offsetX === 0) { // IE, Opera 
      self.controls.mouseX = event.offsetX;
      self.controls.mouseY = event.offsetY;
    } else if (event.layerX || event.layerX === 0) { // Chrome, FF, Safari(?)
      self.controls.mouseX = event.layerX;
      self.controls.mouseY = event.layerY;
    }
  }, false);

  document.addEventListener("mousedown", function () {
    self.controls.mouseDown = true;
  }, false);

  document.addEventListener("mouseup", function () {
    self.controls.mouseDown = false;
  }, false);

};

// Adds event listeners for mobile controls
Input.prototype.mlisten = function () {

  var self = this;

  if (window.DeviceMotionEvent !== undefined) {
    window.ondevicemotion = function (event) {
      self.mcontrols.xaccel = event.accelerationIncludingGravity.x;
      self.mcontrols.yaccel = event.accelerationIncludingGravity.y;
      self.mcontrols.zaccel = event.accelerationIncludingGravity.z;
      self.mcontrols.alpha = event.rotationRate.alpha;
      self.mcontrols.beta = event.rotationRate.beta;
      self.mcontrols.gamma = event.rotationRate.gamma;
    };
  }

  document.addEventListener("touchstart", function (event) {
    if (event.touches.length > 0) {
      self.mcontrols.tapping = true;
    }
  }, false);
  document.addEventListener("touchend", function (event) {
    if (event.touches.length === 0) {
      self.mcontrols.tapping = false;
    }
  }, false);

  window.onorientationchange = function () {
    if (window.orientation === 0) {
      self.mcontrols.orientation = 0;
    } else if (window.orientation === 90) {
      self.mcontrols.orientation = 90;
    } else if (window.orientation === -90) {
      self.mcontrols.orientation = -90;
    } else if (window.orientation === 180) {
      self.mcontrols.orientation = 180;
    }
  };

  window.onorientationchange();

};