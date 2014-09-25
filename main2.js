/*
Function hierarchy:
- canvas
- input
- system
  - controls
  - mcontrols
*/
function Game2() {

  // Sets up the canvas
  this.canvas = document.getElementById("myCanvas");
  
  // Sets up the FPS counter
  this.setupStats();

  if (this.canvas.getContext) {
    this.setupCanvas(this.canvas);
  }

  // Instantiating core classes
  this.input = new Input();
  this.cookies = new Cookies();
  this.mathx = new Math2();

  // Setting up the system
  this.system = {
    isMobile: navigator.userAgent.match(/(iPad|iPhone|iPod|android)/i) !== null, // constant
    controls: this.input.controls,
    mcontrols: this.input.mcontrols,
    stage: 0, // variable - determines the overall state of the game
    gameSpeed: 1, // variable - increases by gameAccel every frame
    gameAccel: 0.001, // constant - speed at which gameSpeed increases
    // firstFrame: false, // reports true during the frame a point is scored
    shake: 0, // used for making the screen scale up during hits (0-3)
    scaled: false, // used to tell if the canvas is already scaled
    score: {
      current: 0, // variable - score of current round
      high: 10, // variable - high score
      frame: 0, // frames for animation
      HSframe: 0, // current frame for high score anim.
      HSlength: 120 // constant - length (in frames) of high score anim.
    },
    character: {
      x: 50, // variable - x position (0 to 100)
      dx: 0, // variable - horizontal speed (approx. -1 to 1)
      speed: 0.15, // constant - dx increment
      friction: 0.91 // constant - dx friction
    },
    paddle: {
      tilt: 90, // variable - paddle direction (0 to 180)
      speed: 3 // constant - tilt speed
    },
    balls: {
      data: [new Ball()], // list of balls
      avgBallX: 0, // variable - average ball x position
      avgBallY: 0 // variable - average ball y position
    },
    target: {
      x: 20, // variable - x position (0 to 100)
      y: 20, // variable - y position (0 to 75)
      size: 6 // constant - target size (in terms of screen-units)
    },
    particles: {
      data: [], // list of particle positions
      perTarget: 10, // constant - number of particles generated
      max: 40, // constant - maximum number of particles on screen
      gravity: 0.05, // constant - dy increment representing gravity
      width: 0.5 // constant - width of particles in screen-units
    },
    itemBox: {
      x: 80, // variable - x position (0 to 100)
      y: 20, // variable - y position (0 to 75)
      size: 10, // constant - target size (in terms of screen-units)
      appearing: false, // variable - tells whether item is showing or not
      direction: 45, // variable - current direction
      turnSpeed: 1 // constant - speed at which the direction changes
    },
    itemDisplay: {
      current: 0, // variable - the current item the user actually has
      displayed: 0, // variable - the item displayed (part of animation)
      frame: 0 // variable - the current frame
    },
    intro: {
      messages: ["can you beat the highscore?"],
      currentMsg: 0, // msg num currently displayed, if messages.length > 1
      msgPos: 0, // variable - x position (0 to 100)
      msgOpacity: 0, // variable - transparency (0 - clear to 100 - opaque)
      frame: 1 // frames for animation (1 to 180)
    },
    title: {
      frame: 0, // frames for animation (1 to 60)
      titleOpacity: 0, // variable - transparency (0 - clear to 100 - opaque)
      buttonOpacity: 0 // variable - transparency ""
    },
    instructions: {
      unpressed: false, // variable - if the button has been unpressed
      // since entering the menu
      repressed: false, // variable - if the button has been repressed
      // since being unpressed
      reunpressed: false
    },
    paused: false // variable - if the game is paused
  };

  this.drawer = new Draw(this.canvas, this.system);

  this.gameLoop();

}

// Resets the canvas's size
Game2.prototype.setupCanvas = function (canvas) {
  window.onresize = function () {
    var screenRatio = window.innerWidth / window.innerHeight;
    if (screenRatio > (4 / 3)) {
      canvas.height = window.innerHeight;
      canvas.width = window.innerHeight * (4 / 3);
      if (screenRatio - (4 / 3) > 0.01) {
        canvas.style.borderWidth = "0px 2px";
      } else {
        canvas.style.borderWidth = "0px";
      }
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth * (3 / 4);
      if (screenRatio - (4 / 3) < -0.01) {
        canvas.style.borderWidth = "2px 0px";
      } else {
        canvas.style.borderWidth = "0px";
      }
    }
  };

  window.onresize();
};

// Sets up the FPS counter
Game2.prototype.setupStats = function () {
  this.stats = new Stats();
  this.stats.setMode(0); // 0: fps, 1: ms

  // Align top-left
  this.stats.domElement.style.position = 'absolute';
  this.stats.domElement.style.left = '0px';
  this.stats.domElement.style.top = '0px';

  document.body.appendChild(this.stats.domElement);
};

// Runs the main game loop
Game2.prototype.gameLoop = function () {
  var self = this;
  setInterval(function () {
    self.stats.begin();
    
    self.checkPause();
    if (!self.system.paused) {
      self.update();
    }
    self.drawer.render();
    
    self.stats.end();
    
  }, 1000 / 60);
};

// Updates the game's paused state
Game2.prototype.checkPause = function () {
  // code
};

/*
// Runs the main game loop - calculations and rendering
Game2.prototype.gameLoop = function () {
  var self = this;
  var setfps = 60; // this is the intended fps that the game is set to
  var fpsFilter = 50; // this determines how many frames to average
  var thisLoop;
  var lastLoop = new Date();
  var thisFrameFPS;

  var pauseFrames = 0;
  var pauseReleased = false;
  
  var clock = setInterval(function() {
    
    if (!this.paused) {
      self.update();
    }
    self.drawer.render();

    thisLoop = new Date();
    if (thisLoop - lastLoop === 0) {
      thisFrameFPS = 60;
      // Fallback to prevent "NaN" fps
    } else {
      thisFrameFPS = 1000 / (thisLoop - lastLoop);
    }
    self.currentfps += (thisFrameFPS - self.currentfps) / fpsFilter;
    lastLoop = thisLoop;
    if (!self.system.controls.space && !self.system.mcontrols.tapping) {
      pauseReleased = true;
    }
    if (!self.paused) {
      if (self.system.isMobile && self.system.mcontrols.tapping && self.system.stage === 3 && pauseReleased) {
        if (pauseFrames > 30) {
          pauseFrames = 1;
          pauseReleased = false;
        } else {
          self.paused = true;
          pauseReleased = false;
        }
      }
      if (!self.system.isMobile && self.system.controls.space && self.system.stage === 3 && pauseReleased) {
        self.paused = true;
        pauseReleased = false;
      }
    } else {
      pauseFrames++;
      if (self.system.isMobile && self.system.ioscontrols.tapping && self.system.stage === 3 && pauseReleased) {
        if (pauseFrames > 30) {
          pauseFrames = 1;
          pauseReleased = false;
        } else {
          self.paused = false;
          pauseReleased = false;
        }
      }
      if (!self.system.isMobile && self.system.controls.space && self.system.stage === 3 && pauseReleased) {
        self.paused = false;
        pauseReleased = false;
      }
    }
    
  }, 1000 / setfps);
};
*/

Game2.prototype.update = function () {
  
};

window.onload = new Game2();