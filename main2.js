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
    stage: 1, // variable - determines the overall state of the game
    gameSpeed: 1, // variable - increases by gameAccel every frame
    gameAccel: 0.0001, // constant - speed at which gameSpeed increases
    // firstFrame: false, // reports true during the frame a point is scored
    shake: 0, // used for making the screen scale up during hits (0-3)
    shakelength: 6, // number of frames for the screen to shake
    scaled: false, // used to tell if the canvas is already scaled
    totalhits: 0, // total number of targets hit
    score: {
      current: 0, // variable - score of current round
      high: 10, // variable - high score
      frame: 0, // frames for animation
      HSframe: 0, // current frame for high score anim.
      HSlength: 120 // constant - length (in frames) of high score anim.
    },
    combos: {
      current: 0, // current combo
      hitonbounce: false, // has a target been hit on the current bounce?
      frames: 0 // frames for showing combo streak (out of 60)
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
      if (self.system.isMobile && self.system.mcontrols.tapping && self.system.stage === 3 && pauseReleased) {
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

// Updates the game's paused state
Game2.prototype.checkPause = function () {
  // code
};

// Updates all game data, including menus, animations, etc.
Game2.prototype.update = function () {

  // Main game
  if (this.system.stage === 0) {

    this.updateGame();

  }
  
  // Main menu (default)
  if (this.system.stage === 1) {
    
    this.updateMenu();
  }
  
  // Instructions
  if (this.system.stage === 2) {
    
    this.updateInstructions();
    
  }

};

// Updates the main menu
Game2.prototype.updateMenu = function () {
  
  this.system.title.frame++;
  if (this.system.title.frame < 30) {
    this.system.title.titleOpacity = (this.system.title.frame / 30) * 100;
    this.system.title.buttonOpacity = 0;
  } else if (this.system.title.frame >= 30 && this.system.title.frame < 60) {
    this.system.title.titleOpacity = 100;
    this.system.title.buttonOpacity = ((this.system.title.frame - 30) / 30) * 100;
  } else if (this.system.title.frame === 60) {
    this.system.title.titleOpacity = 100;
    this.system.title.buttonOpacity = 100;
  } else if (this.system.title.frame > 60) {
    if (!this.system.isMobile && this.system.controls.space === true) {
      this.system.stage = 2;
    }
    if (this.system.isMobile && this.system.mcontrols.tapping === true) {
      this.system.stage = 2;
    }
  }
  
};

// Updates the instructions
Game2.prototype.updateInstructions = function () {
  
  if (this.system.instructions.unpressed === false) {
    if (!this.system.isMobile && this.system.controls.space === false || this.system.isMobile && this.system.mcontrols.tapping === false) {
      this.system.instructions.unpressed = true;
    }
  } else if (this.system.instructions.unpressed) {
    if (!this.system.isMobile && this.system.controls.space === true || this.system.isMobile && this.system.mcontrols.tapping === true) {
      this.system.instructions.repressed = true;
    }
  }
  if (this.system.instructions.repressed) {
    if (!this.system.isMobile && this.system.controls.space === false || this.system.isMobile && this.system.mcontrols.tapping === false) {
      this.system.instructions.reunpressed = true;
      this.system.stage = 0;
    }
  }
  
};

// Updates the data of the core game
Game2.prototype.updateGame = function () {

  this.updateGameShake();
  this.updateScoreDisplay();
  this.updateGameCombos();
  this.updateGameCharacter();
  this.updateGameBalls();
  this.updateGamePaddle();
  this.updateGameCollisions();
  this.updateGameItems();
  this.updateGameParticles();

};

// Updates the screen shaking status/timer
Game2.prototype.updateGameShake = function () {

  if (this.system.shake > 0) {
    this.system.shake++;
    if (this.system.shake > this.system.shakelength) {
      this.system.shake = 0;
    }
  }

};

// Updates score counting
Game2.prototype.updateScoreDisplay = function () {
  if (this.system.score.frame > 0) {
    this.system.score.frame -= 1;
  }

  if (this.system.score.HSframe > 0) {
    this.system.score.HSframe -= 1;
  }

  if (isNaN(this.system.score.high)) {
    this.system.score.high = 100;
  }
};

// Updates high score
Game2.prototype.updateHighScore = function () {
  this.system.score.high = this.system.score.current;
  this.system.score.HSframe = this.system.score.HSlength;
};

// Updates game combos
Game2.prototype.updateGameCombos = function () {
  if (this.system.combos.frames > 0) {
    this.system.combos.frames--;
  }
};

// Updates the character's position
Game2.prototype.updateGameCharacter = function () {

  if (this.system.isMobile) {

    var charx = this.system.character.x;
    var ballx = this.system.balls.avgBallX;
    var tiltx;
    if (this.system.mcontrols.orientation === 0) {
      tiltx = (this.system.mcontrols.xaccel + 3) * 15;
    } else if (this.system.mcontrols.orientation === 90) {
      tiltx = ((0 - this.system.mcontrols.yaccel) + 3) * 15;
    } else if (this.system.mcontrols.orientation === -90) {
      tiltx = (this.system.mcontrols.yaccel + 3) * 15;
    } else if (this.system.mcontrols.orientation === 180) {
      tiltx = ((0 - this.system.mcontrols.xaccel) + 3) * 15;
    }
    //this.system.character.x = ((charx * 13) + ballx + tiltx) / 15;
    this.system.character.x = ((charx * 9) + tiltx) / 10;

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

  if (this.system.balls.data.length === 0) {
    this.updateGameOver();
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
  this.system.balls.data.push(new Ball(50, 5, 0, 0));
  this.system.paddle.tilt = 90;
  /*
  Reset's the character's position - not sure if necessary
  if (!system.ism) {
  system.character.x = 50;
  system.character.dx = 0;
  }
  */

  if (this.system.score.current > this.system.score.high) {
    this.updateHighScore();
    this.cookies.createCookie(this.system.score.current);
  }
  this.system.score.current = 0;
  this.system.combos.current = 0;
  this.system.combos.hitonbounce = false;
  this.system.totalhits = 0;
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
      if (!this.system.combos.hitonbounce) {
        this.system.combos.current = 0;
      } else {
        this.system.combos.hitonbounce = false;
      }
    }
  }

  // Tests for collision with target
  for (i = 0; i < this.system.balls.data.length; i++) {
    this.testTargetCollision(i);
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

// Tests the collision between the ball and target
Game2.prototype.testTargetCollision = function (num) {
  var target = this.system.target;
  var ball = this.system.balls.data[num];
  if (this.mathx.distance(ball.x, ball.y, target.x, target.y) < (target.size + ball.size)) {
    this.system.gameSpeed = 1 + (this.system.gameAccel * this.system.score.current);
    this.system.balls.data[num].gravity = -0.05 - ((this.system.gameAccel * this.system.score.current) / 25);
    this.system.combos.current += 1;
    this.system.combos.frames = 60;
    var baseScore = 10;
    if (this.system.combos.current > 1) {
      baseScore += this.system.combos.current;
    }
    if (this.system.itemDisplay.current === 2) {
      this.system.score.current += baseScore * 3;
      this.createGameParticles(target.x, target.y);
    } else {
      this.system.score.current += baseScore;
    }
    this.system.totalhits += 1;
    this.system.combos.hitonbounce = true;
    this.system.score.frame = 60;
    this.system.shake = 1;
    this.createGameParticles(target.x, target.y);
    var x, y, i;
    for (i = 0; i <= 50; i++) {
      x = 20 + Math.round(Math.random() * 60);
      y = 10 + Math.round(Math.random() * 30);
      // var tooClose = this.mathx.distance(ball.x, ball.y, target.x, target.y) < 30;
      // var tooFar = this.mathx.distance(ball.x, ball.y, target.x, target.y) > 60;
      if (this.mathx.distance(ball.x, ball.y, x, y) > 20 && this.mathx.distance(ball.x, ball.y, x, y < 40)) {
        i = 51;
      }
    }
    this.system.target.x = x;
    this.system.target.y = y;
    this.system.firstFrame = true;
  }
};

// Updates game logic pertaining to items
Game2.prototype.updateGameItems = function () {
  
  // items:
  // 0: none
  // 1: random animation
  // 2: 3x
  // 3: extra balls
  // 4: magnet
  
  // This rotates the item box
  this.system.itemBox.direction += this.system.itemBox.turnSpeed;
  if (this.system.itemBox.direction >= 360) {
    this.system.itemBox.direction = 0;
  }

  // This ensures the itembox resets upon death
  if (this.system.score.current < 10) {
    this.system.itemDisplay.displayed = 0;
    this.system.itemDisplay.current = 0;
    this.system.itemDisplay.frame = 0;
    this.system.itemBox.appearing = false;
  }

  if (this.system.totalhits % 20 === 5 && this.system.firstFrame) {
    this.createItemBox();
  }

  var itemBoxCollided = false;
  if (this.system.itemBox.appearing === true) {
    for (i = 0; i < this.system.balls.data.length; i++) {
      if (this.checkItemCollision(i)) {
        itemBoxCollided = true;
      }
    }
    if (itemBoxCollided) {
      this.system.itemBox.appearing = false;
      this.createGameParticles(this.system.itemBox.x, this.system.itemBox.y);
      this.system.itemDisplay.current = 1;
      this.system.itemDisplay.displayed = 1;
      this.system.itemDisplay.frame = 660;
    }
  }

  if (this.system.itemDisplay.frame > 0) {
    this.system.itemDisplay.frame--;
    if (this.system.itemDisplay.frame === 600) {
      this.system.itemDisplay.current = Math.floor(Math.random() * 3) + 2;
      // this.system.itemDisplay.current = 3; for testing
      this.system.itemDisplay.displayed = this.system.itemDisplay.current;
    }
    if (this.system.itemDisplay.frame === 540 || this.system.itemDisplay.frame === 480) {
      if (this.system.itemDisplay.current === 3) {
        var lastBall = this.system.balls.data.length - 1;
        this.system.balls.data.push(new Ball(this.system.balls.data[lastBall].x, this.system.balls.data[lastBall].y, this.system.balls.data[lastBall].dx, this.system.balls.data[lastBall].dy));
      }
    }
  }

  if (this.system.itemDisplay.frame === 0) {
    // This prevents the magnet from ending whilthis.e the ball is falling (to troll the player)
    if (this.system.balls.data[0].dy < 0 && this.system.itemDisplay.current === 4) {
      this.system.itemDisplay.frame++;
    } else {
      this.system.itemDisplay.current = 0;
      this.system.itemDisplay.displayed = 0;
    }
  }

  this.system.firstFrame = false;
};

// Shows an item box
Game2.prototype.createItemBox = function () {
  this.system.itemBox.direction = 45;
  this.system.itemBox.appearing = true;

  var x, y, i, j, tooClose;
  // loop to try to place item away from balls 10 times
  for (i = 0; i <= 10; i++) {
    x = 20 + Math.round(Math.random() * 60);
    y = 10 + Math.round(Math.random() * 35);
    tooClose = false;
    // loop to compare item position to each ball
    for (j = 0; j < this.system.balls.data.length; j++) {
      if (this.mathx.distance(this.system.balls.data[j].x, this.system.balls.data[j].y, this.system.itemBox.x, this.system.itemBox.y) < 20) {
        tooClose = true;
      }
    }
    if (!tooClose) {
      i = 11;
    }
  }
  this.system.itemBox.x = x;
  this.system.itemBox.y = y;
};

// Checks to see if ball (num) colliding w/ item box
Game2.prototype.checkItemCollision = function (num) {
  var direction = this.system.itemBox.direction;
  var itemx = this.system.itemBox.x;
  var itemy = this.system.itemBox.y;
  var ballx = this.system.balls.data[num].x;
  var bally = this.system.balls.data[num].y;
  var size = this.system.itemBox.size;
  var ballsize = this.system.balls.data[num].size;

  var point1; // vertices of the square
  var point2; // ...
  var point3; // ...
  var point4; // ...
  var slope1; // slope of points 1 & 2 or 3 & 4
  var slope2; // slope of ponits 1 & 3 or 2 & 4
  var yint12; // y intereps of lines between given points
  var yint13; // ...
  var yint24; // ...
  var yint34; // ...

  point1 = this.mathx.rotatePoint(itemx, itemy, this.mathx.toRadians(direction), itemx - ((0.5 * size) + ballsize), itemy - ((0.5 * size) + ballsize));
  point2 = this.mathx.rotatePoint(itemx, itemy, this.mathx.toRadians(direction), itemx + ((0.5 * size) + ballsize), itemy - ((0.5 * size) + ballsize));
  point3 = this.mathx.rotatePoint(itemx, itemy, this.mathx.toRadians(direction), itemx - ((0.5 * size) + ballsize), itemy + ((0.5 * size) + ballsize));
  point4 = this.mathx.rotatePoint(itemx, itemy, this.mathx.toRadians(direction), itemx + ((0.5 * size) + ballsize), itemy + ((0.5 * size) + ballsize));

  // Assign slopes...

  if (point1.x === point2.x) {
    slope1 = "undefined";
  } else {
    slope1 = ((point2.y - point1.y) / (point2.x - point1.x));
  }

  if (point1.x === point3.x) {
    slope2 = "undefined";
  } else {
    slope2 = ((point3.y - point1.y) / (point3.x - point1.x));
  }

  // Assign y intercepts...

  if (slope1 === "undefined") {
    yint12 = "undefined";
    yint34 = "undefined";
  } else {
    yint12 = point1.y - (slope1 * point1.x);
    yint34 = point3.y - (slope1 * point3.x);
  }

  if (slope2 === "undefined") {
    yint13 = "undefined";
    yint24 = "undefined";
  } else {
    yint13 = point1.y - (slope2 * point1.x);
    yint24 = point2.y - (slope2 * point2.x);
  }

  // Check for collision on line from 1 to 2

  if (point1.x === point2.x) {
    if (point1.y > point2.y) { // right side of the square
      if (ballx > point1.x) {
        return false;
      }
    } else { // left side of the square
      if (ballx < point1.x) {
        return false;
      }
    }
  } else if (point1.x < point2.x) { // top side of the square
    if (bally < yint12 + (slope1 * ballx)) {
      return false;
    }
  } else if (point1.x > point2.x) { // bottom side of the square
    if (bally > yint12 + (slope1 * ballx)) {
      return false;
    }
  }

  // Check for collision on line from 3 to 4

  if (point3.x === point4.x) {
    if (point3.y > point4.y) { // left side of the square
      if (ballx < point3.x) {
        return false;
      }
    } else { // right side of the square
      if (ballx > point3.x) {
        return false;
      }
    }
  } else if (point3.x < point4.x) { // bottom side of the square
    if (bally > yint34 + (slope1 * ballx)) {
      return false;
    }
  } else if (point3.x > point4.x) { // top side of the square
    if (bally < yint34 + (slope1 * ballx)) {
      return false;
    }
  }

  // Check for collision on line from 1 to 3

  if (point1.x === point3.x) {
    if (point1.y > point3.y) { // left side of the square
      if (ballx < point1.x) {
        return false;
      }
    } else { // right side of the square
      if (ballx > point1.x) {
        return false;
      }
    }
  } else if (point1.x < point3.x) { // bottom side of the square
    if (bally > yint13 + (slope2 * ballx)) {
      return false;
    }
  } else if (point1.x > point3.x) { // top side of the square
    if (bally < yint13 + (slope2 * ballx)) {
      return false;
    }
  }

  // Check for collision on line from 2 to 4

  if (point2.x === point4.x) {
    if (point2.y > point4.y) { // right side of the square
      if (ballx > point2.x) {
        return false;
      }
    } else { // left side of the square
      if (ballx < point2.x) {
        return false;
      }
    }
  } else if (point2.x < point4.x) { // top side of the square
    if (bally < yint24 + (slope2 * ballx)) {
      return false;
    }
  } else if (point2.x > point4.x) { // bottom side of the square
    if (bally > yint24 + (slope2 * ballx)) {
      return false;
    }
  }

  return true;

};

// Updates game particles' physics
Game2.prototype.updateGameParticles = function () {
  var i;
  for (i = 0; i < this.system.particles.data.length; i++) {
    this.system.particles.data[i].vy += this.system.particles.gravity;

    this.system.particles.data[i].x += this.system.particles.data[i].vx;
    this.system.particles.data[i].y += this.system.particles.data[i].vy;

    if (this.system.particles.data[i].y > 75) {
      this.system.particles.data.splice(i, 1);
    }
  }
};

// Creates new particles at intended location
Game2.prototype.createGameParticles = function (targetx, targety) {
  var i;
  for (i = 1; i <= this.system.particles.perTarget; i++) {
    if (this.system.particles.data.length < this.system.particles.max) {
      var data = {};
      data.x = targetx;
      data.y = targety;
      data.vx = (Math.random() - 0.5) * 3;
      data.vy = Math.random() * -2;
      this.system.particles.data.push(data);
    }
  }
};

window.onload = new Game2();