// *********
// STRUCTURE
// *********

/*
The contents of this game's logic and rendering is all contained withing game().
game() is launched at the end with the statement "window.onload = game;"
*/

/*
TODO:
- change constants to NAMES_LIKE_THIS?
- add touch controls
- animate instructions
- add shadows?
- fade-in effect for target appearing?
- adjust tilt controls

shadows:
ctx.shadowBlur = 5;
ctx.shadowColor = "#FFF";
ctx.shadowOffsetX = 4;
ctx.shadowOffsetY = 6;
*/

function Game() {

  this.canvas = document.getElementById("myCanvas");

  if (this.canvas.getContext) {

    this.setupCanvas(this.canvas);

  }

  // ********
  // CONTROLS
  // ********

  var input = new Input();
  var controls = input.controls;
  var ioscontrols = input.ioscontrols;

  // **********
  // GAME LOGIC
  // **********

  /*
	The "system" variable stores information related to the objects and logic
	of the game, as well as some animations - rendering is treated separately.
	Keeping all of these variables in one place allow them to be easily
	accessible and easily changeable (whether it's changed during development
	to balance the game, or changed by an item/power-up to add challenge).
	
	The stage variable (system.stage) represents the current "stage" or "scene" in
	the overall game.
	- 0 represents the intro
	- 1 represents the main menu
	- 2 represents the instructions
	- 3 represents the main game
	*/

  var system = {
    stage: 0,
    gameSpeed: 1, // variable - increases by gameAccel every frame
    gameAccel: 0.001, // constant - speed at which gameSpeed increases
    firstFrame: false, // reports true during the frame a point is scored
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
    currentfps: 0, // variable - the current FPS
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
    paused: false, // variable - if the game is paused
    isiOS: navigator.userAgent.match(/(iPad|iPhone|iPod)/i) !== null // constant
  };

  /*
	Ball Class:
	
	Properties:
	x - variable - x position of the ball in screen-units (0 to 100)
	y - variable - y position of the ball in screen-units (0 to 75)
	dx - variable - x velocity of the ball in screen-units per frame
	dy - variable - y velocity of the ball in screen-units per frame
	direction - variable - direction of the ball in degrees (0 is up)
	colliding - variable - boolean representing present collision with paddle
	cooldown - variable - 5-frame cooldown for sensing collisions (0 to 5)
	gravity - variable - affects dy, increases based on gameSpeed
	size - constant - ball radius in screen-units
	bounciness - constant - velocity in screen-units when bouncing off paddle
	fadeIn - variable - boolean representing if ball is respawning
	fadeFrame - variable - incremented frame number (0 to 60)
	fadeFrameTotal - consant - number of frames for respawning
	*/
  function Ball(copy) {
    if (copy) {
      this.x = system.balls.data[system.balls.data.length - 1].x;
      this.y = system.balls.data[system.balls.data.length - 1].y;
      this.dx = system.balls.data[system.balls.data.length - 1].dx;
      this.dy = system.balls.data[system.balls.data.length - 1].dy;
      this.fadeFrame = 8;
      this.fadeFrameTotal = 8;
    } else {
      this.x = 50;
      this.y = 5;
      this.dx = 0;
      this.dy = 0;
      this.fadeFrame = 60;
      this.fadeFrameTotal = 60;
    }
    this.direction = 0;
    this.colliding = false;
    this.cooldown = 0;
    this.gravity = -0.05;
    this.size = 3.5;
    this.bounciness = 2.2;
    this.fadeIn = true;
  }

  // ***************
  // BASIC GAME LOOP
  // ***************

  /*
	The main "loop" of this game that keeps everything going is the loop
	gameLoop() which repeats with the use of the variable clock.
	
	Within it, there are two parts: update() for game logic, and draw()
	for rendering everything on the canvas.
	*/

  var setfps = 60; // this is the intended fps that the game is set to
  var currentfps = 0; // this displays the FPS the game is being rendered at
  var fpsFilter = 50; // this determines how many frames to average
  var clock = setInterval(gameLoop, 1000 / setfps);
  var thisLoop;
  var lastLoop = new Date();
  var thisFrameFPS;

  var pauseFrames = 0;
  var paused = false;
  var pauseReleased = false;

  var drawer = new Draw(this.canvas, system);

  function gameLoop() {

    if (!paused) {
      update();
    }
    drawer.render();

    thisLoop = new Date();
    if (thisLoop - lastLoop === 0) {
      thisFrameFPS = 60;
      // Fallback to prevent "NaN" fps
    } else {
      thisFrameFPS = 1000 / (thisLoop - lastLoop);
    }
    currentfps += (thisFrameFPS - currentfps) / fpsFilter;
    lastLoop = thisLoop;

    pauseFrames++;
    if (!controls.space && !ioscontrols.tapping) {
      pauseReleased = true;
    }
    if (!paused) {
      if (system.isiOS && ioscontrols.tapping && system.stage === 3 && pauseReleased) {
        if (pauseFrames > 30) {
          pauseFrames = 1;
          pauseReleased = false;
        } else {
          paused = true;
          pauseReleased = false;
        }
      }
      if (!system.isiOS && controls.space && system.stage === 3 && pauseReleased) {
        paused = true;
        pauseReleased = false;
      }
    } else {
      if (system.isiOS && ioscontrols.tapping && system.stage === 3 && pauseReleased) {
        if (pauseFrames > 30) {
          pauseFrames = 1;
          pauseReleased = false;
        } else {
          paused = false;
          pauseReleased = false;
        }
      }
      if (!system.isiOS && controls.space && system.stage === 3 && pauseReleased) {
        paused = false;
        pauseReleased = false;
      }
    }

    system.currentfps = currentfps;
    system.paused = paused;

  }

  // Includes cookie functions
  var cookies = new Cookies();

  if (cookies.getCookie()) {
    system.score.high = cookies.getCookie();
  }

  // Includes math functions
  var mathx = new Math2();

  function update() {

    // ****************
    // 0 - Introduction
    // ****************

    /*
		To animate the intro, a frame counter is used which increments each
		game loop. In this case, the intro animation displaying a custom
		message is three seconds long, and since the game plays at 60 FPS,
		the intro will take 180 frames.
		
		The first 30 frames are spent having the message quickly glide torward
		x:40 and increasing its opacity to 100. The next 120 frames are spent
		have the message glide from x:40 to x:60. The following 30 frames are
		spent having the message glide to x:100 and decreasing its opacity
		to 0.
		
		As a convenience, if the user has played before, a message will display
		in the bottom-right corner to notify the user that they can skip the
		introduction by pressing space or tapping the screen.
		*/

    if (system.stage === 0) {
      system.intro.frame++;
      if (system.intro.frame < 30) {
        system.intro.msgPos = (system.intro.frame / 30) * 40;
        system.intro.msgOpacity = (system.intro.frame / 30) * 100;
      } else if (system.intro.frame >= 30 && system.intro.frame < 150) {
        system.intro.msgPos = (((system.intro.frame - 30) / 120) * 20) + 40;
        system.intro.msgOpacity = 100;
      } else if (system.intro.frame >= 150 && system.intro.frame < 180) {
        system.intro.msgPos = (((system.intro.frame - 150) / 30) * 40) + 60;
        system.intro.msgOpacity = ((180 - system.intro.frame) / 30) * 100;
      } else if (system.intro.frame === 180) {
        system.intro.msgOpacity = 0;
        system.intro.msgPos = 100;
        if (system.intro.currentMsg + 1 === system.intro.messages.length) {
          system.stage = 1;
        } else {
          system.intro.currentMsg++;
          system.intro.frame = 0;
        }
      }

      if (system.score.high > 10) { // if the user has played before
        if (controls.space || ioscontrols.tapping) {
          system.stage = 1;
        }
      }
    }

    // ***************
    // 1 - Menu Screen
    // ***************

    /*
		To animate the menu screen, a frame counter is used which increments
		each game loop. In this case, the title appears via an opacity effect
		after half a second, and the button / start text appears after another
		half a second.
		
		To start the game, either the space bar must be pressed (for desktop
		players) or the screen must be tapped (for iOS users).
		*/

    if (system.stage === 1) {
      system.title.frame++;
      if (system.title.frame < 30) {
        system.title.titleOpacity = (system.title.frame / 30) * 100;
        system.title.buttonOpacity = 0;
      } else if (system.title.frame >= 30 && system.title.frame < 60) {
        system.title.titleOpacity = 100;
        system.title.buttonOpacity = ((system.title.frame - 30) / 30) * 100;
      } else if (system.title.frame === 60) {
        system.title.titleOpacity = 100;
        system.title.buttonOpacity = 100;
      } else if (system.title.frame > 60) {
        if (!system.isiOS && controls.space === true) {
          system.stage = 2;
        }
        if (system.isiOS && ioscontrols.tapping === true) {
          system.stage = 2;
        }
      }
    }

    // ****************
    // 2 - Instructions
    // ****************

    /*
		The instructions screen is not currently animated, though it may be
		in the future.
		
		When the instructions menu is started, the user is most likely still
		be pressing space / tapping the screen to activate the menu - therefore
		the button or tap must still be unpressed. Once this is done, then the
		button or tap can be repressed to start the game.
		*/

    if (system.stage === 2) {
      if (system.instructions.unpressed === false) {
        if (!system.isiOS && controls.space === false) {
          system.instructions.unpressed = true;
        }
        if (system.isiOS && ioscontrols.tapping === false) {
          system.instructions.unpressed = true;
        }
      } else if (system.instructions.unpressed) {
        if (!system.isiOS && controls.space === true) {
          system.instructions.repressed = true;
        }
        if (system.isiOS && ioscontrols.tapping === true) {
          system.instructions.repressed = true;
        }
      }
      if (system.instructions.repressed) {
        if (!system.isiOS && controls.space === false) {
          system.instructions.reunpressed = true;
          system.stage = 3;
        }
        if (system.isiOS && ioscontrols.tapping === false) {
          system.instructions.reunpressed = true;
          system.stage = 3;
        }
      }
    }

    // *************
    // 3 - Main Game
    // *************

    if (system.stage === 3) {

      // ************
      // Shake update
      // ************

      if (system.shake > 0) {
        system.shake++;
        if (system.shake > 7) {
          system.shake = 0;
        }
      }

      // *************
      // Score updates
      // *************

      /*
			The system.score.frames attribute determines the opacity of the
			large score in display on the background of the game - so as the
			score increases (and the variable returns to 60 each time), the
			opacity will again decrease every frame until it reaches 0.
			
			Also, a high score message will appear whenever whenever you get a
			new high score. This is used with the system.score.HSlength variable
			(which indicates the length the message appears) and the
			system.score.HSframe variable which keeps track of the animation.
			updateHighScore() is called in the program under the ball updates
			section.
			*/

      if (system.score.frame > 0) {
        system.score.frame -= 1;
      }

      if (system.score.HSframe > 0) {
        system.score.HSframe -= 1;
      }

      if (isNaN(system.score.high)) {
        system.score.high = 10;
      }

      var updateHighScore = function () {
        system.score.high = system.score.current;
        system.score.HSframe = system.score.HSlength;
      };

      // *****************
      // Character updates
      // *****************

      /*
			Controlling the character depends based on whether you are playing
			on iOS or desktop.
			
			If you are using iOS, then your character's x position is set to
			your raw x position based on the y acceleration value (-3 produces
			x:0 and 3 produces x:100), averaged with your current x position,
			averaged with the ball's x position. They are weighted as 1 for
			the raw x, 1 for the ball x, and 13 for the current x.
			
			The position wasn't originally averaged with the ball x, but this
			was included to make the game easier to pick up and play.
			
			If you are playing on a desktop, then when you press either
			directional arrow key, your velocity increases/decreases
			appropriately, as well as your x velocity being partially averaged
			with that of the ball (again, to make the game seemingly easier).
			*/

      if (system.isiOS) {

        var iOSMoveCharacter = function () {

          var charx = system.character.x;
          var ballx = system.balls.avgBallX;
          var tiltx;
          if (ioscontrols.orientation === 0) {
            tiltx = (ioscontrols.xaccel + 3) * 15;
          } else if (ioscontrols.orientation === 90) {
            tiltx = ((0 - ioscontrols.yaccel) + 3) * 15;
          } else if (ioscontrols.orientation === -90) {
            tiltx = (ioscontrols.yaccel + 3) * 15;
          } else if (ioscontrols.orientation === 180) {
            tiltx = ((0 - ioscontrols.xaccel) + 3) * 15;
          }
          system.character.x = ((charx * 13) + ballx + tiltx) / 15;

        };

        iOSMoveCharacter();

        /*
				Directly controlling the character by its x velocity tends to
				be too difficult / impractical.
				
				if (system.character.x - (((0 - ioscontrols.yaccel) + 3) * 15) > 5) {
					system.character.dx -= system.character.speed;
				}
				if (system.character.x - (((0 - ioscontrols.yaccel) + 3) * 15) < -5) {
					system.character.dx += system.character.speed;
				}
				system.character.dx *= system.character.friction;
				system.character.x += system.character.dx;
				*/

      } else {

        if (controls.right === true) {
          system.character.dx += system.character.speed;
          system.character.x = ((system.character.x * 29) + system.balls.avgBallX) / 30;
        }
        if (controls.left === true) {
          system.character.dx -= system.character.speed;
          system.character.x = ((system.character.x * 29) + system.balls.avgBallX) / 30;
        }
        system.character.dx *= system.character.friction;
        system.character.x += system.character.dx;

      }

      /*
			To make sure the character doesn't go outside of the bounds of the
			screen, we have some if conditionals that reset the x position
			appropriately when that happens.
			*/

      if (system.character.x > 100) {
        system.character.x = 100;
      }
      if (system.character.x < 0) {
        system.character.x = 0;
      }

      // ************
      // Ball updates
      // ************

      /*
			Determines the values of system.balls.avgBallX and
			system.balls.avgBallY;
			*/

      if (system.balls.data.length > 0) {
        var totalX = 0;
        var totalY = 0;
        var totalBalls = system.balls.data.length;
        var i;
        for (i = 0; i < totalBalls; i++) {
          totalX += system.balls.data[i].x;
          totalY += system.balls.data[i].y;
        }
        system.balls.avgBallX = totalX / totalBalls;
        system.balls.avgBallY = totalY / totalBalls;
      }

      /*
			The ball's location and physics and such should not update if the
			ball is still "fading in" or respawning. This way the player has
			time to recenter their paddle if they are using the iPad version
			of the game.
			*/

      var i;
      for (i = 0; i < system.balls.data.length; i++) {

        if (system.balls.data[i].fadeIn) {

          system.balls.data[i].fadeFrame--;
          if (system.balls.data[i].fadeFrame === 0) {
            system.balls.data[i].fadeIn = false;
          }

        } else {

          /*
			This changes the ball's y velocity according to the set gravity,
			and then changes the ball's x and y position based on it's x and y
			velocities as well as the game speed (which increases when your
			score gets higher, as a form of added difficulty).
			*/

          system.balls.data[i].dy += system.balls.data[i].gravity;

          system.balls.data[i].x += system.balls.data[i].dx * system.gameSpeed;
          system.balls.data[i].y -= system.balls.data[i].dy * system.gameSpeed;

          /*
			These if statements check to see if the ball has hit the wall -
			if so, then the ball's x position is reset and the x velocity is
			inverted.
			*/

          if (system.balls.data[i].x > (100 - (system.balls.data[i].size * 0.8))) {
            system.balls.data[i].x = (100 - (system.balls.data[i].size * 0.8));
            system.balls.data[i].dx *= -1;
          }

          if (system.balls.data[i].x < (system.balls.data[i].size * 0.8)) {
            system.balls.data[i].x = (system.balls.data[i].size * 0.8);
            system.balls.data[i].dx *= -1;
          }

          /*
			This makes the ball follow the character directly if the magnet
			item is activated.
			*/

          if (system.itemDisplay.current === 4) {
            system.balls.data[i].x = system.character.x;
            if (system.itemDisplay.frame === 1) {
              system.balls.data[i].dx = system.character.dx;
            } else {
              system.balls.data[i].dx = 0;
            }
          }

          /*
			When the ball falls off the screen, the ball is removed from the
			array of balls. The iterator (i) has to be decremented to
			compensate for the removed item (or else one of the balls won't
			update).
			*/

          if (system.balls.data[i].y > 75) {
            system.balls.data.splice(i, 1);
            i--;
          }

        }

      }

      /*
			This updates the game when the ball reaches the bottom of the
			screen (aka death). A number of things happens:
			- gameSpeed is reset to 1 (normal speed)
			- the ball's x and y positions are reset (to x: 50, y: 5)
			- the balls x and y velocities are reset (both to 0)
			- the paddle's tilt is reset to 90
			- the character's x position and velocity are reset if the player
              is playing on a desktop
			- the highscore is updated if the current score is a new record
			- the highscore is set to a cookie if the current score is a record
			- the current score is reset to 0
			- the fade in / respawn sequence is started for iOS players
			*/

      /*
			if (system.ball.y > 75) {
				system.gameSpeed = 1;
				system.ball.x = 50;
				system.ball.y = 5;
				system.ball.dy = 0;
				system.ball.dx = 0;
				system.paddle.tilt = 90;
				system.ball.fadeIn = true;
				system.ball.fadeFrame = system.ball.fadeFrameTotal;
				if (!system.isiOS) {
					system.character.x = 50;
					system.character.dx = 0;
				}
				if (system.score.current > system.score.high) {
					updateHighScore();
					createCookie();
				}
				system.score.current = 0;
			}
			*/

      if (system.balls.data.length === 0) {
        system.gameSpeed = 1;
        system.balls.data.push(new Ball());
        system.paddle.tilt = 90;
        /*
				Reset's the character's position - not sure if necessary
				if (!system.isiOS) {
					system.character.x = 50;
					system.character.dx = 0;
				}
				*/
        if (system.score.current > system.score.high) {
          updateHighScore();
          cookies.createCookie(system.score.current);
        }
        system.score.current = 0;
      }

      // *************
      // Paddle updates
      // *************

      /*
			Originally the paddle on the character could be adjusted with
			the up and down arrow keys - and while this did work, it did find
			itself to be somewhat difficult for some people. So while I added
			the auto-tilting mechanism for iOS use, I decided to include it on
			the desktop version as well.
			
			if (!system.isiOS) {
				if (controls.up === true) {
					system.paddle.tilt += system.paddle.speed;
				}
				if (controls.down === true) {
					system.paddle.tilt -= system.paddle.speed;
				}
			} else
				...
			}
			*/

      var updatePaddle = function () {

        /*
				The targetY is set to a Y position so that if it is greater
				than 30 units, then it will count as if it is less than 30
				based on its absolute value. This way if the target is low,
				then the paddle won't tilt very sharply to reach it - rather
				it will tilt more upwards to help you instead.
				*/

        var targetX = system.target.x;
        var targetY = 30 - Math.abs(system.target.y - 30);
        var paddleX = system.character.x;
        var paddleY = 58; // the height of the paddle remains constant
        var toTarget = mathx.toDegrees(Math.atan((targetY - paddleY) / (targetX - paddleX)));

        // This prevents problems with a negative paddle tilt
        if (toTarget < 0) {
          toTarget += 180;
        }

        var ballX = system.balls.avgBallX;
        var ballY = system.balls.avgBallY;

        var toBall = mathx.toDegrees(Math.atan((ballY - paddleY) / (ballX - paddleX)));

        if (toBall < 0) {
          toBall += 180;
        }

        /*
				Here you can see the final direction is an average of the
				direction required to point to the ball and the direction
				required to point to the target, and then moved a bit more to
				90 degrees (up).
				*/

        var finalTilt = (toTarget + toBall) / 2;
        finalTilt = ((finalTilt - 90) * 0.5) + 90;

        system.paddle.tilt = finalTilt;
      };

      updatePaddle();

      /*
			This prevents the paddle from tilting too far from the left or
			right, although it shouldn't really be much of a problem with the
			auto tilting.
			*/

      if (system.paddle.tilt > 180) {
        system.paddle.tilt = 180;
      }
      if (system.paddle.tilt < 0) {
        system.paddle.tilt = 0;
      }

      // *******************
      // Collision detection
      // *******************

      /*
			The only collision in the game that is somewhat difficult is the
			collision between the paddle and the ball - other collisions like
			between the ball and the target are simple since they just use the
			mathx.distance() function as they're circular objects.
			
			Javascript doesn't have any built in functions for detecting
			collisions, and I wasn't interested in using a large library, so I
			decided to write the code for the collision myself (which ended up
			not being too complicated).
			
			The way it works is that the game keeps track of a set of five
			points that represent the top line of the paddle. The game then
			checks every frame to see if the ball is making contact with any
			of the points (if the distance between them is less than the radius
			of the ball), and if so, a collision is made.
			
			To prevent multiple collision hits from being detected in a short
			period of time, there is a "cooldown" variable which is set to 5
			when a collision is detected and is decremented every frame until
			it reaches 0, so as long as it is greater than 0, another collision
			cannot be detected.
			*/

      var ballCollision = function (num) {

        // The collision detection system first assumes that there is
        // no collision, and changes the boolean if necessary:

        system.balls.data[num].colliding = false;

        if (system.balls.data[num].cooldown > 0) {

          system.balls.data[num].cooldown--;

        } else {

          /*
					An array of the coordinates of the paddle's collision box
					assuming it is tilted upwards - x is relative to the
					character, y is based on the grid.
					*/

          var collpoints = [-8, 56,
          -4, 56,
          0, 56,
          4, 56,
          8, 56];

          // The center of rotation for the paddle

          var centerx = system.character.x;
          var centery = 62;

          var ballx = system.balls.data[num].x;
          var bally = system.balls.data[num].y;
          var ballsize = system.balls.data[num].size;

          /*
					For each of the collpoints, they calculate the correct
					position of the point (which accounts for the tilt of the
					paddle), and then check to see if the distance between the
					ball and the point are less than the radius of the ball.
					1 is added to the radius of the ball for calculation
					purposes to take into account for inaccuracies and other
					close collisions.
					*/

          var temp;

          temp = mathx.rotatePoint(centerx, centery, mathx.toRadians(system.paddle.tilt - 90), system.character.x + collpoints[0], collpoints[1]);
          if (mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
            system.balls.data[num].colliding = true;
            system.balls.data[num].cooldown = 5;
          }
          temp = mathx.rotatePoint(centerx, centery, mathx.toRadians(system.paddle.tilt - 90), system.character.x + collpoints[2], collpoints[3]);
          if (mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
            system.balls.data[num].colliding = true;
            system.balls.data[num].cooldown = 5;
          }
          temp = mathx.rotatePoint(centerx, centery, mathx.toRadians(system.paddle.tilt - 90), system.character.x + collpoints[4], collpoints[5]);
          if (mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
            system.balls.data[num].colliding = true;
            system.balls.data[num].cooldown = 5;
          }
          temp = mathx.rotatePoint(centerx, centery, mathx.toRadians(system.paddle.tilt - 90), system.character.x + collpoints[6], collpoints[7]);
          if (mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
            system.balls.data[num].colliding = true;
            system.balls.data[num].cooldown = 5;
          }
          temp = mathx.rotatePoint(centerx, centery, mathx.toRadians(system.paddle.tilt - 90), system.character.x + collpoints[8], collpoints[9]);
          if (mathx.distance(temp.x, temp.y, ballx, bally) < ballsize + 1) {
            system.balls.data[num].colliding = true;
            system.balls.data[num].cooldown = 5;
          }

        }

      };

      for (i = 0; i < system.balls.data.length; i++) {
        ballCollision(i);
      }

      // Calculates the direction of the balls, used for bouncing
      for (i = 0; i < system.balls.data.length; i++) {
        system.balls.data[i].direction = mathx.toDegrees(Math.atan2(system.balls.data[i].dy, system.balls.data[i].dx)) - 90;
      }

      /*
			The bounce function is used for when a collision is detected with
			the ball and the paddle. It's worth noting that the direction the
			ball goes in is not in fact "correct" in a realistic sense - the
			ball goes directly in the direction that the paddle is in, so it
			does not take into account its original direction when bouncing.
			
			The "dir" argument is the direction that the ball should bounce in.
			
			A commented piece of code for the variable "speed" was used for
			calculating the speed of the ball based on its current x and y
			velocities - however this was too inconvenient, and it led to
			small amounts of velocity being lost over time which caused
			problems.
			*/

      var bounce = function (num, dir) {
        // var speed = Math.sqrt(Math.pow(system.ball.dx, 2) + Math.pow(system.ball.dy, 2));
        system.balls.data[num].direction = dir; // + (dir - (180 - system.ball.direction));
        system.balls.data[num].dx = system.balls.data[num].bounciness * (Math.sin(mathx.toRadians(system.balls.data[num].direction)));
        system.balls.data[num].dy = system.balls.data[num].bounciness * (Math.cos(mathx.toRadians(system.balls.data[num].direction)));
      };

      for (i = 0; i < system.balls.data.length; i++) {
        if (system.balls.data[i].colliding) {
          bounce(i, system.paddle.tilt - 90);
        }
      }

      // ****************
      // Update particles
      // ****************

      /*
			As an added visual effect, small white square "particles" explode
			off the target when a point is scored. This serves as a form of
			"eye candy" and gives the player a sense of reward and tangibility
			in hitting a target.
			
			Particles are generated with the generateParticles() method
			whenever a target is hit, and are updated every frame with the
			updateParticles() method.
			
			The particles are stored in an array, each as an object with x, y,
			vx, and vy properties.
			
			When a particle is generated, the x velocity is set to a random
			number from -1.5 to 1.5, and the y velocity is set to a random
			number from -2 to 0.
			
			To avoid possible lag, a "max" number of particles is set to
			prevent lag if many targets are hit in succession.
			*/

      var generateParticles = function (targetx, targety) {
        var i;
        for (i = 1; i <= system.particles.perTarget; i++) {
          if (system.particles.data.length < system.particles.max) {
            var data = {};
            data.x = targetx;
            data.y = targety;
            data.vx = (Math.random() - 0.5) * 3;
            data.vy = Math.random() * -2;
            system.particles.data.push(data);
          }
        }
      };

      var updateParticles = function () {
        var i;
        for (i = 0; i < system.particles.data.length; i++) {
          system.particles.data[i].vy += system.particles.gravity;

          system.particles.data[i].x += system.particles.data[i].vx;
          system.particles.data[i].y += system.particles.data[i].vy;

          if (system.particles.data[i].y > 75) {
            system.particles.data.splice(i, 1);
          }
        }
      };

      updateParticles();

      // **************
      // Target updates
      // **************

      /*
			This if statement checks to see if the ball has hit the target
			(based on the distance between them). If so, a number of things
			will happen:
			- gameSpeed increases
			- gravity increases (to compensate for the gameSpeed)
			- the score increases
			- the "frames" variable for the score (which makes it flash) is
              reset to 60
			- particles are generated
			- the target is moved to a new position
			- firstFrame is set to true
			
			To choose the target's new position, the game loops through
			choosing five random positions, and if the position is far enough
			away from the ball (by at least 20 screen-units), then the target
			is set to that position. Since it only checks five times, it is
			possible for the target to still end up close to the ball, but
			it should not be a major problem.
			*/

      var targetCollision = function (num) {
        if (mathx.distance(system.balls.data[num].x, system.balls.data[num].y, system.target.x, system.target.y) < (system.target.size + system.balls.data[num].size)) {
          system.gameSpeed = 1 + (system.gameAccel * system.score.current);
          system.balls.data[num].gravity = -0.05 - ((system.gameAccel * system.score.current) / 25);
          if (system.itemDisplay.current === 2) {
            system.score.current += 3;
            generateParticles(system.target.x, system.target.y);
          } else {
            system.score.current += 1;
          }
          system.score.frame = 60;
          system.shake = 1;
          generateParticles(system.target.x, system.target.y);
          var x, y, i;
          for (i = 0; i <= 10; i++) {
            x = 20 + Math.round(Math.random() * 60);
            y = 10 + Math.round(Math.random() * 35);
            if (mathx.distance(system.balls.data[num].x, system.balls.data[num].y, system.target.x, system.target.y) > 30) {
              i = 11;
            }
          }
          system.target.x = x;
          system.target.y = y;
          system.firstFrame = true;
        }
      };

      for (i = 0; i < system.balls.data.length; i++) {
        targetCollision(i);
      }

      // ************
      // Item updates
      // ************

      /*
			The IDs for different "items" in the game (system.item.current)
			are as follows:
			- 0: no item
			- 1: undetermined item
			- 2: triple points
			- 3: triple ball
			- 4: magnet
			*/

      var showItemBox = function () {
        system.itemBox.direction = 45;
        system.itemBox.appearing = true;

        var x, y, i, j, tooClose;
        for (i = 0; i <= 10; i++) {
          x = 20 + Math.round(Math.random() * 60);
          y = 10 + Math.round(Math.random() * 35);
          tooClose = false;
          for (j = 0; j < system.balls.data.length; j++) {
            if (mathx.distance(system.balls.data[j].x, system.balls.data[j].y, system.itemBox.x, system.itemBox.y) < 20) {
              tooClose = true;
            }
          }
          if (!tooClose) {
            i = 11;
          }
        }
        system.itemBox.x = x;
        system.itemBox.y = y;
      };

      var itemCollision = function (num) {

        var direction = system.itemBox.direction;
        var itemx = system.itemBox.x;
        var itemy = system.itemBox.y;
        var ballx = system.balls.data[num].x;
        var bally = system.balls.data[num].y;
        var size = system.itemBox.size;
        var ballsize = system.balls.data[num].size;

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

        point1 = mathx.rotatePoint(itemx, itemy, mathx.toRadians(direction), itemx - ((0.5 * size) + ballsize), itemy - ((0.5 * size) + ballsize));
        point2 = mathx.rotatePoint(itemx, itemy, mathx.toRadians(direction), itemx + ((0.5 * size) + ballsize), itemy - ((0.5 * size) + ballsize));
        point3 = mathx.rotatePoint(itemx, itemy, mathx.toRadians(direction), itemx - ((0.5 * size) + ballsize), itemy + ((0.5 * size) + ballsize));
        point4 = mathx.rotatePoint(itemx, itemy, mathx.toRadians(direction), itemx + ((0.5 * size) + ballsize), itemy + ((0.5 * size) + ballsize));

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

      // This rotates the item box
      system.itemBox.direction += system.itemBox.turnSpeed;
      if (system.itemBox.direction >= 360) {
        system.itemBox.direction = 0;
      }

      // This ensures the itembox resets upon death
      if (system.score.current < 10) {
        system.itemDisplay.displayed = 0;
        system.itemDisplay.current = 0;
        system.itemDisplay.frame = 0;
        system.itemBox.appearing = false;
      }

      if (system.score.current % 20 === 10 && system.firstFrame) {
        showItemBox();
      }

      var itemBoxCollided = false;
      if (system.itemBox.appearing === true) {
        for (i = 0; i < system.balls.data.length; i++) {
          if (itemCollision(i)) {
            itemBoxCollided = true;
          }
        }
        if (itemBoxCollided) {
          system.itemBox.appearing = false;
          generateParticles(system.itemBox.x, system.itemBox.y);
          system.itemDisplay.current = 1;
          system.itemDisplay.displayed = 1;
          system.itemDisplay.frame = 660;
        }
      }

      if (system.itemDisplay.frame > 0) {
        system.itemDisplay.frame--;
        if (system.itemDisplay.frame === 600) {
          system.itemDisplay.current = Math.floor(Math.random() * 3) + 2;
          // system.itemDisplay.current = 4; // for testing
          system.itemDisplay.displayed = system.itemDisplay.current;
        }
        if (system.itemDisplay.frame === 540 || system.itemDisplay.frame === 480) {
          if (system.itemDisplay.current === 3) {
            system.balls.data.push(new Ball(true));
          }
        }
      }

      if (system.itemDisplay.frame === 0) {
        // This prevents the magnet from ending while the ball is falling (to troll the player)
        if (system.balls.data[0].dy < 0 && system.itemDisplay.current === 4) {
          system.itemDisplay.frame++;
        } else {
          system.itemDisplay.current = 0;
          system.itemDisplay.displayed = 0;
        }
      }

      // *****
      // Other
      // *****

      system.firstFrame = false;

    }

  }

}

Game.prototype.setupCanvas = function (canvas) {
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

window.onload = new Game();