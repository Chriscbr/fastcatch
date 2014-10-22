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
      friction: 0.91, // constant - dx friction
      movementAssist: 0.003 // constant - greater the value, easier game is
    },
    paddle: {
      tilt: 90, // variable - paddle direction (0 to 180)
      speed: 3 // constant - tilt speed
    },
    balls: {
      data: [new Ball(50, 5, 0, 0)], // list of balls
      avgBallX: 50, // variable - average ball x position
      avgBallY: 50 // variable - average ball y position
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

// Updates all game data, including menus, animations, etc.
Game2.prototype.update = function () {

  // Main game
  if (this.system.stage === 0) {

    this.updateGame();

  }

};

// Updates the data of the core game
Game2.prototype.updateGame = function () {

  this.updateGameCharacter();
  this.updateGameBalls();
  this.updateGamePaddle();
  this.updateGameCollisions();

};

// Updates the character's position
Game2.prototype.updateGameCharacter = function () {

  if (this.system.isMobile) {

    var charx = this.system.character.x;
    var ballx = this.system.balls.avgBallX;
    var tiltx;
    if (this.system.ioscontrols.orientation === 0) {
      tiltx = (this.system.ioscontrols.xaccel + 3) * 15;
    } else if (this.system.ioscontrols.orientation === 90) {
      tiltx = ((0 - this.system.ioscontrols.yaccel) + 3) * 15;
    } else if (this.system.ioscontrols.orientation === -90) {
      tiltx = (this.system.ioscontrols.yaccel + 3) * 15;
    } else if (this.system.ioscontrols.orientation === 180) {
      tiltx = ((0 - this.system.ioscontrols.xaccel) + 3) * 15;
    }
    this.system.character.x = ((charx * 13) + ballx + tiltx) / 15;

  } else {

    if (this.system.controls.right === true) {
      this.system.character.dx += this.system.character.speed +
        ((this.system.balls.avgBallX - this.system.character.x) * this.system.character.movementAssist);
    }
    if (this.system.controls.left === true) {
      this.system.character.dx -= this.system.character.speed +
        ((this.system.character.x - this.system.balls.avgBallX) * this.system.character.movementAssist);
    }
    this.system.character.dx *= this.system.character.friction;
    this.system.character.x += this.system.character.dx;

  }

  if (this.system.character.x > 100) {
    this.system.character.x = 100;
  }
  if (this.system.character.x < 0) {
    this.system.character.x = 0;
  }

};

// Update's the balls
Game2.prototype.updateGameBalls = function () {

  // Update avgBallX and avgBallY
  var i;
  if (this.system.balls.data.length > 0) {
    var totalX = 0;
    var totalY = 0;
    var totalBalls = this.system.balls.data.length;
    for (i = 0; i < totalBalls; i++) {
      totalX += this.system.balls.data[i].x;
      totalY += this.system.balls.data[i].y;
    }
    this.system.balls.avgBallX = totalX / totalBalls;
    this.system.balls.avgBallY = totalY / totalBalls;
  } else {
    this.updateGameOver();
  }

  // Update individual balls
  for (i = 0; i < this.system.balls.data.length; i++) {

    // Prevents updates while ball is respawning
    if (this.system.balls.data[i].fadeIn) {

      this.system.balls.data[i].fadeFrame--;

      if (this.system.balls.data[i].fadeFrame === 0) {
        this.system.balls.data[i].fadeIn = false;
      }

    } else {

      // Updates x and y velocities
      this.system.balls.data[i].dy += this.system.balls.data[i].gravity;

      this.system.balls.data[i].x += this.system.balls.data[i].dx * this.system.gameSpeed;
      this.system.balls.data[i].y -= this.system.balls.data[i].dy * this.system.gameSpeed;

      // Wall detection
      if (this.system.balls.data[i].x > (100 - (this.system.balls.data[i].size * 0.8))) {
        this.system.balls.data[i].x = (100 - (this.system.balls.data[i].size * 0.8));
        this.system.balls.data[i].dx *= -1;
      }

      if (this.system.balls.data[i].x < (this.system.balls.data[i].size * 0.8)) {
        this.system.balls.data[i].x = (this.system.balls.data[i].size * 0.8);
        this.system.balls.data[i].dx *= -1;
      }

      // Magnet item
      if (this.system.itemDisplay.current === 4) {

        this.system.balls.data[i].x = this.system.character.x;

        // Prevents ball from moving unpredictably after item ends
        if (this.system.itemDisplay.frame === 1) {
          this.system.balls.data[i].dx = this.system.character.dx;
        } else {
          this.system.balls.data[i].dx = 0;
        }

      }

      // Remove ball if fallen off screen (and update counting variable to compensate)
      if (this.system.balls.data[i].y > 75) {
        this.system.balls.data.splice(i, 1);
        i--;
      }

    }

  }

};

// Updates the paddle
Game2.prototype.updateGamePaddle = function () {
  // First determines angle to point at target
  var targetX = this.system.target.x;
  var targetY = 30 - Math.abs(this.system.target.y - 30);
  var paddleX = this.system.character.x;
  var paddleY = 58;
  var toTarget = this.mathx.toDegrees(Math.atan((targetY - paddleY) / (targetX - paddleX)));

  // Prevents negative paddle tilt
  if (toTarget < 0) {
    toTarget += 180;
  }

  // Second determines angle to point at ball
  var ballX = this.system.balls.avgBallX;
  var ballY = this.system.balls.avgBallY;
  var toBall = this.mathx.toDegrees(Math.atan((ballY - paddleY) / (ballX - paddleX)));

  if (toBall < 0) {
    toBall += 180;
  }

  // Third averages the two angles
  var toFinal = (toTarget + toBall) / 2;
  toFinal = ((toFinal - 90) * 0.5) + 90;

  this.system.paddle.tilt = toFinal;
};

// Updates the game when a game over occurs
Game2.prototype.updateGameOver = function () {
  this.system.gameSpeed = 1;
  this.system.balls.data.push(new Ball());
  this.system.paddle.tilt = 90;
  /*
  Reset's the character's position - not sure if necessary
  if (!system.isiOS) {
  system.character.x = 50;
  system.character.dx = 0;
  }
  */

  // Include!!!
  /*
  if (this.system.score.current > this.system.score.high) {
    updateHighScore();
    this.cookies.createCookie(this.system.score.current);
  }
  this.system.score.current = 0;
  */
};

// Handles the general collisions in the game
Game2.prototype.updateGameCollisions = function () {

  for (i = 0; i < this.system.balls.data.length; i++) {
    this.updateGameCollisionsHelper(i);
  }

  // Calculates the direction of each ball, used for bouncing
  for (i = 0; i < this.system.balls.data.length; i++) {
    this.system.balls.data[i].direction = this.mathx.toDegrees(Math.atan2(this.system.balls.data[i].dy, this.system.balls.data[i].dx)) - 90;
  }

  var self = this;
  var bounce = function (ballNum, direction) {
    self.system.balls.data[ballNum].direction = direction;
    self.system.balls.data[ballNum].dx = self.system.balls.data[ballNum].bounciness * (Math.sin(self.mathx.toRadians(self.system.balls.data[ballNum].direction)));
    self.system.balls.data[ballNum].dy = self.system.balls.data[ballNum].bounciness * (Math.cos(self.mathx.toRadians(self.system.balls.data[ballNum].direction)));
  };

  for (i = 0; i < this.system.balls.data.length; i++) {
    if (this.system.balls.data[i].colliding) {
      bounce(i, this.system.paddle.tilt - 90);
    }
  }

};

// Used by updateGameCollisions to handle individual ball-paddle collision
Game2.prototype.updateGameCollisionsHelper = function (ballNum) {
  this.system.balls.data[ballNum].colliding = false;
  
  if (this.system.balls.data[ballNum].cooldown > 0) {
    
    this.system.balls.data[ballNum].cooldown--;
    
  } else {

    // Coordinates of paddle's collision in neutral position
    var collpoints = [8, 56,
                    -4, 56,
                    0, 56,
                    4, 56,
                    8, 56];
    // Center of paddle rotation
    var centerx = this.system.character.x;
    var centery = 62;

    var ballx = this.system.balls.data[ballNum].x;
    var bally = this.system.balls.data[ballNum].y;
    var ballsize = this.system.balls.data[ballNum].size;

    var temp;

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(this.system.paddle.tilt - 90), this.system.character.x + collpoints[0], collpoints[1]);
    if (this.mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
      this.system.balls.data[ballNum].colliding = true;
      this.system.balls.data[ballNum].cooldown = 5;
    }

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(this.system.paddle.tilt - 90), this.system.character.x + collpoints[2], collpoints[3]);
    if (this.mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
      this.system.balls.data[ballNum].colliding = true;
      this.system.balls.data[ballNum].cooldown = 5;
    }

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(this.system.paddle.tilt - 90), this.system.character.x + collpoints[4], collpoints[5]);
    if (this.mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
      this.system.balls.data[ballNum].colliding = true;
      this.system.balls.data[ballNum].cooldown = 5;
    }

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(this.system.paddle.tilt - 90), this.system.character.x + collpoints[6], collpoints[7]);
    if (this.mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
      this.system.balls.data[ballNum].colliding = true;
      this.system.balls.data[ballNum].cooldown = 5;
    }

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(this.system.paddle.tilt - 90), this.system.character.x + collpoints[8], collpoints[9]);
    if (this.mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
      this.system.balls.data[ballNum].colliding = true;
      this.system.balls.data[ballNum].cooldown = 5;
    }
  }
};

Game2.prototype.newHighScore = function () {
  this.system.score.high = this.system.score.current;
  this.system.score.HSframe = this.system.score.HSlength;
};

window.onload = new Game2();