// STRUCTURE

/*
The contents of this game's logic and rendering is all contained withing game().
game() is launched at the end with the statement "window.onload = game;"
*/

function game() {

	// GETTING THE CANVAS
	
	/*
	First the canvas variable is defined so it can be operated on with the HTML page.
	The canvas's width and height are set so they will form a 4:3 aspect ratio while
	maximizing screenspace. The dimensions will update when the window is readjusted
	using window.onresize.
	
	Note: objects and positions in the game are defined using a positioning system
	with x and y values ranging as follows:
	- X: 0 (left edge) to 100 (right edge)
	- Y: 0 (top edge) to 75 (bottom edge)
	*/
	
	var canvas = document.getElementById("myCanvas");
	var screenRatio = window.innerWidth / window.innerHeight;
	if (screenRatio > (4/3)) {
		canvas.height = window.innerHeight;
		canvas.width = window.innerHeight * (4/3);
	} else {
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth * (3/4)
	}
	
	window.onresize = function() {
		screenRatio = window.innerWidth / window.innerHeight;
		if (screenRatio > (4/3)) {
		canvas.height = window.innerHeight;
		canvas.width = window.innerHeight * (4/3);
		} else {
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth * (3/4)
		}
	}
	
	var isiPad = navigator.userAgent.match(/iPad/i) != null;
	
	// BASIC GAME LOOP
	
	/*
	The main "loop" of this game that keeps everything going is the loop
	gameLoop() which repeats with the use of the variable clock.
	
	Within it, there are two parts: update() for game logic, and draw()
	for rendering everything on the canvas.
	*/
	
	var setfps = 60; // this is the intended fps that the game is set to
	var currentfps = 0; // this displays the previous fps, based on the average of the last roughly 50 frames
	var fpsFilter = 50; // this determines how many frames to take into calculation
	var clock = setInterval(gameLoop, 1000 / setfps); // 1000 milliseconds, divided by 60 frames per second, gives us the amount of time between each frame
	var lastLoop = new Date;
	
	function gameLoop() {
		update();
		draw();
		
		var thisLoop = new Date;
		var thisFrameFPS = 1000 / (thisLoop - lastLoop);
		currentfps += (thisFrameFPS - currentfps) / fpsFilter;
		lastLoop = thisLoop;
	}
	
	var debug = true; // Debug mode
	
	// CONTROLS
	
	/* 
	To make variables for the controls easily accessible in other parts of the program,
	I used an object called controls with different attributes for the different values.
	
	I use various event listeners to detect if key presses or mouse movements are made -
	these are then used for variables.
	
	Keycode reference: http://unixpapa.com/js/key.html
	*/
	
	var controls = {
		left: false,
		up: false,
		right: false,
		down: false,
		space: false,
		mouseX: 0,
		mouseY: 0,
		mouseDown: false
	}
	
	if (isiPad) { //prevent scrolling on ios devices
		document.ontouchmove = function(event) {
			event.preventDefault();
		}
	}
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	canvas.addEventListener("mousemove", mouseMove, false);
	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mouseup", mouseUp, false);
	
	function keyDown(key) {
		
		if (key.keyCode == 32) {
			controls.space = true;
		}
		if (key.keyCode == 37) {
			controls.left = true;
		}
		if (key.keyCode == 38) {
			controls.up = true;
		}
		if (key.keyCode == 39) {
			controls.right = true;
		}
		if (key.keyCode == 40) {
			controls.down = true;
		}
		
	}
	
	function keyUp(key) {
		
		if (key.keyCode == 32) {
			controls.space = false;
		}
		if (key.keyCode == 37) {
			controls.left = false;
		}
		if (key.keyCode == 38) {
			controls.up = false;
		}
		if (key.keyCode == 39) {
			controls.right = false;
		}
		if (key.keyCode == 40) {
			controls.down = false;
		}
		
	}
	
	/*
	Note: layerX and layerY used since they determine the mouse's
	x and y position *relative* to the canvas.
	*/
	function mouseMove(event) {
		
		if (event.offsetX || event.offsetX == 0) { // IE, Opera 
			controls.mouseX = event.offsetX;
			controls.mouseY = event.offsetY;
		} else if (event.layerX || event.layerX == 0) { // Chrome, Firefox, Safari(?)
			controls.mouseX = event.layerX;
			controls.mouseY = event.layerY;
		}
		
		/* original version
		if (event.layerX || event.layerX == 0) { // Firefox
			controls.mouseX = event.layerX;
			controls.mouseY = event.layerY;
		} else if (event.offsetX || event.offsetX == 0) { // Opera
			controls.mouseX = event.offsetX;
			controls.mouseY = event.offsetY;
		}
		*/
		
	}
	
	function mouseDown() {
		
		controls.mouseDown = true;
		
	}
	
	function mouseUp() {
		
		controls.mouseDown = false;
		
	}
	
	// https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html
	// https://developer.apple.com/library/safari/documentation/SafariDOMAdditions/Reference/DeviceOrientationEventClassRef/DeviceOrientationEvent/DeviceOrientationEvent.html
	var ioscontrols = {
		xaccel: 0, // x acceleration (In the plane of the screen, positive towards the right side of the screen.)
		yaccel: 0, // y acceleration (In the plane of the screen, positive towards the top of the screen.)
		zaccel: 0, // z accelaration (Perpendicular to the screen, positive out of the screen.)
		alpha: 0, // rotation, in degrees, of the device frame around its z-axis.
		beta: 0, // rotation, in degrees, of the device frame around its x-axis.
		gamma: 0, // rotation, in degrees, of the device frame around its y-axis.
		tapping: false
	};
	
	if (window.DeviceMotionEvent !== undefined) {
		window.ondevicemotion = function(event) {
			ioscontrols.xaccel = event.accelerationIncludingGravity.x;
			ioscontrols.yaccel = event.accelerationIncludingGravity.y;
			ioscontrols.zaccel = event.accelerationIncludingGravity.z;
			ioscontrols.alpha = event.rotationRate.alpha;
			ioscontrols.beta = event.rotationRate.beta;
			ioscontrols.gamma = event.rotationRate.gamma;
		}
	}
	
	if (isiPad) {
		document.addEventListener("touchstart", touchStart, false);
		document.addEventListener("touchmove", touchMove, false);
		document.addEventListener("touchend", touchEnd, false);
		document.addEventListener("touchcancel", touchCancel, false);
	
		function touchStart(event) {
			if (event.touches.length > 0) {
				ioscontrols.tapping = true;
			}
		}
		
		function touchMove(event) {
			// code
		}
		
		function touchEnd(event) {
			if (event.touches.length === 0) {
				ioscontrols.tapping = false;
			}
		}
		
		function touchCancel(event) {
			// code
		}
	}
	
	// UPDATING GAME LOGIC
	
	/*
	
	The stage variable (system.stage) represents the current "stage" or "scene" in the overall game.
	- 0 represents the intro
	- 1 represents the main menu
	- 2 represents the instructions
	- 3 represents the main game
	
	*/
	
	var system = {
		stage: 0,
		score: {
			current: 0, // variable - score of current round
			high: 0, // variable - high score
			cooldown: 0 // frames for animation
		},
		character: {
			x: 50, // variable - x position (0 to 100)
			dx: 0, // variable - horizontal speed (approx. -1 to 1)
			speed: 0.1, // constant - dx increment
			friction: 0.91 // constant - dx friction
		},
		panel: {
			tilt: 90, // variable - panel direction (0 to 180)
			speed: 3 // constant - tilt speed
		},
		ball: {
			x: 50, // variable - x position (0 to 100)
			y: 5, // variable - y position (0 to 75)
			dx: 0, // variable - horizontal speed
			dy: 0, // variable - vertical speed
			direction: 0, // variable - direction (unknown range)
			colliding: false, // variable - boolean representing collision with panel
			cooldown: 0, // variable - temporary 5-tick cooldown for sensing collisions
			gravity: -0.05, // constant - dy increment representing to gravity
			size: 3.5, // constant - ball radius (in terms of screen-units)
			bounciness: 2.2 // variable - increases each time the score increases
		},
		target: {
			x: 20, // variable - x position (0 to 100)
			y: 20, // variable - y position (0 to 75)
			size: 6  // constant - target size (in terms of screen-units)
		}
	}
	
	var intro = {
		messages: ["Can you beat the highscore?"],
		currentMsg: 0,
		msgPos: 0, // from 0 (left edge) to 100 (right edge)
		msgOpacity: 0, // from 0 (clear) to 100 (opaque)
		frame: 1 // each message should take about 180 frames
	}
	
	var title = {
		frame: 0,
		titleOpacity: 0,
		buttonOpacity: 0
	}
	
	var instructions = {
		unpressed: false,
		repressed: false
	}
	
	function update() {
		
		// 0 - random phrase slides across screen
		if (system.stage == 0) {
			intro.frame++;
			if (intro.frame < 30) {
				intro.msgPos = (intro.frame / 30) * 40;
				intro.msgOpacity = (intro.frame / 30) * 100;
			} else if (intro.frame >= 30 && intro.frame < 150) {
				intro.msgPos = (((intro.frame - 30) / 120) * 20) + 40;
				intro.msgOpacity = 100;
			} else if (intro.frame >= 150 && intro.frame < 180) {
				intro.msgPos = (((intro.frame - 150) / 30) * 40) + 60;
				intro.msgOpacity = ((180 - intro.frame) / 30) * 100
			} else if (intro.frame == 180) {
				intro.msgOpacity = 0;
				intro.msgPos = 100;
				if (intro.currentMsg + 1 == intro.messages.length) {
					system.stage = 1;
				} else {
					intro.currentMsg++;
					intro.frame = 0;
				}
			}
		}
		
		// 1 - main menu
		if (system.stage == 1) {
			title.frame++;
			if (title.frame < 30) {
				if (title.frame == 1) {
					// play("The Cannery");  // disabled since the music can be annoying while debugging
				}
				title.titleOpacity = (title.frame / 30) * 100;
				title.buttonOpacity = 0;
			} else if (title.frame >= 30 && title.frame < 60) {
				title.titleOpacity = 100;
				title.buttonOpacity = ((title.frame - 30) / 30) * 100;
			} else if (title.frame == 60) {
				title.titleOpacity = 100;
				title.buttonOpacity = 100;
			} else if (title.frame > 60) {
				if (!isiPad && controls.space == true) {
					system.stage = 2;
				}
				if (isiPad && ioscontrols.tapping == true) {
					system.stage = 2;
				}
			}
		}
		
		// 2 - instructions
		if (system.stage == 2) {
			if (instructions.unpressed == false) {
				if (!isiPad && controls.space == false) {
					instructions.unpressed = true;
				}
				if (isiPad && ioscontrols.tapping == false) {
					instructions.unpressed = true;
				}
			} else if (instructions.unpressed) {
				if (!isiPad && controls.space == true) {
					instructions.repressed = true;
					system.stage = 3;
				}
				if (isiPad && ioscontrols.tapping == true) {
					instructions.repressed = true;
					system.stage = 3;
				}
			}
		}
		
		// 3 - main game
		if (system.stage == 3) {
			
			// score update
			if (system.score.cooldown > 0) {
				system.score.cooldown -= 1;
			}
			
			// character updates
			if (!isiPad) {
				if (controls.right == true) {
					system.character.dx += system.character.speed;
				}
				if (controls.left == true) {
					system.character.dx -= system.character.speed;
				}
				system.character.dx *= system.character.friction;
				system.character.x += system.character.dx;
			} else {
				system.character.x = ((system.character.x * 14) + (((0 - ioscontrols.yaccel) + 3) * 15)) / 15;
				/*
				if (system.character.x - (((0 - ioscontrols.yaccel) + 3) * 15) > 5) {
					system.character.dx -= system.character.speed;
				}
				if (system.character.x - (((0 - ioscontrols.yaccel) + 3) * 15) < -5) {
					system.character.dx += system.character.speed;
				}
				system.character.dx *= system.character.friction;
				system.character.x += system.character.dx;
				*/
			}
			
			if (system.character.x > 100) {
				system.character.x = 100;
			}
			if (system.character.x < 0) {
				system.character.x = 0;
			}
			
			var toDegrees = function(rad) {
				return ((rad * 180) / Math.PI);
			};
			
			// panel updates
			/* if (!isiPad) {
				if (controls.up == true) {
					system.panel.tilt += system.panel.speed;
				}
				if (controls.down == true) {
					system.panel.tilt -= system.panel.speed;
				}
			} else { */
				system.panel.tilt = toDegrees(Math.atan(((30 - Math.abs(system.target.y - 30)) - 58) / (system.target.x - system.character.x)));
				if (system.panel.tilt < 0) {
					system.panel.tilt += 180;
				}
				var tiltToBall = toDegrees(Math.atan((system.ball.y - 58) / (system.ball.x - system.character.x)));
				if (tiltToBall < 0) {
					tiltToBall += 180;
				}
				system.panel.tilt = (system.panel.tilt + tiltToBall) / 2;
				system.panel.tilt = ((system.panel.tilt - 90) * 0.5) + 90;
			// }
			
			if (system.panel.tilt > 180) {
				system.panel.tilt = 180;
			}
			if (system.panel.tilt < 0) {
				system.panel.tilt = 0;
			}
			
			// ************
			// Ball updates
			// ************
			
			system.ball.dy += system.ball.gravity;
			
			system.ball.x += system.ball.dx;
			system.ball.y -= system.ball.dy;
			
			if (system.ball.x > (100 - (system.ball.size * 0.8))) {
				system.ball.x = (100 - (system.ball.size * 0.8));
				system.ball.dx *= -1;
			}
			if (system.ball.x < (system.ball.size * 0.8)) {
				system.ball.x = (system.ball.size * 0.8);
				system.ball.dx *= -1;
			}
			if (system.ball.y > 75) { //death
				system.ball.x = 50;
				system.ball.y = 5;
				system.ball.dy = 0;
				system.ball.dx = 0;
				system.ball.bounciness = 2.2;
				system.ball.gravity = -0.05;
				system.panel.tilt = 90;
				if (!isiPad) {
					system.character.x = 50;
					system.character.dx = 0;
				}
				system.character.speed = 0.1;
				if (system.score.current > system.score.high) {
					system.score.high = system.score.current;
				}
				system.score.current = 0;
			}
			
			var toRadians = function(deg) {
				return ((deg * Math.PI) / 180);
			};
			var distance = function(x1, y1, x2, y2) {
				return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
			};
			
			// Function for rotating a point (counterclockwise, technically) - see https://en.wikipedia.org/wiki/Rotation_(mathematics)
			// based on this code: http://stackoverflow.com/questions/3162643/proper-trigonometry-for-rotating-a-point-around-the-origin
			// ...                        angle in radians!
			var rotatePoint = function(cx, cy, angle, px, py) {
				var s = Math.sin(angle);
				var c = Math.cos(angle);
				
				px -= cx;
				py -= cy;
				
				var xnew = px * c - py * s;
				var ynew = px * s + py * c;
				
				var pxnew = xnew + cx;
				var pynew = ynew + cy;
				
				return {x: pxnew, y: pynew};
			};
			
			// *******************
			// Collision detection
			// *******************
			
			var isCollision = function() {
				// coordinates of the panel's collision assuming it is tilted upwards - x is relative to the character, y is based on grid
				var collpoints = [	-8, 56,
									-4, 56,
									0, 56,
									4, 56,
									8, 56];
				
				// center of rotation for the panel
				var centerx = system.character.x;
				var centery = 62;
				
				system.ball.colliding = false;
				
				if (system.ball.cooldown > 0) {
					system.ball.cooldown--;
				} else {
					var temp;
					temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + collpoints[0], collpoints[1]);
					if (distance(temp.x, temp.y, system.ball.x, system.ball.y) < 4) {
						system.ball.colliding = true;
						system.ball.cooldown = 5;
					}
					temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + collpoints[2], collpoints[3]);
					if (distance(temp.x, temp.y, system.ball.x, system.ball.y) < 4) {
						system.ball.colliding = true;
						system.ball.cooldown = 5;
					}
					temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + collpoints[4], collpoints[5]);
					if (distance(temp.x, temp.y, system.ball.x, system.ball.y) < 4) {
						system.ball.colliding = true;
						system.ball.cooldown = 5;
					}
					temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + collpoints[6], collpoints[7]);
					if (distance(temp.x, temp.y, system.ball.x, system.ball.y) < 4) {
						system.ball.colliding = true;
						system.ball.cooldown = 5;
					}
					temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + collpoints[8], collpoints[9]);
					if (distance(temp.x, temp.y, system.ball.x, system.ball.y) < 4) {
						system.ball.colliding = true;
						system.ball.cooldown = 5;
					}
				}
			}
			
			isCollision();
			
			system.ball.direction = toDegrees(Math.atan2(system.ball.dy, system.ball.dx)) - 90;
			
			var bounce = function(dir) { // the argument "dir" is the direction of the surface being bounced against (in degrees)
				//var speed = Math.sqrt(Math.pow(system.ball.dx, 2) + Math.pow(system.ball.dy, 2));
				system.ball.direction = dir // + (dir - (180 - system.ball.direction));
				system.ball.dx = system.ball.bounciness * (Math.sin(toRadians(system.ball.direction)));
				system.ball.dy = system.ball.bounciness * (Math.cos(toRadians(system.ball.direction)));
			};
			
			if (system.ball.colliding) {
				bounce(system.panel.tilt - 90);
			}
			
			// target updates
			
			if (distance(system.ball.x, system.ball.y, system.target.x, system.target.y) < (system.target.size + system.ball.size)) {
				system.score.current += 1;
				system.score.cooldown = 60;
				// system.ball.gravity -= 0.001;
				// system.ball.bounciness += 0.02;
				// system.character.speed += 0.0002;
				var x, y, i;
				for (i = 0; i <= 5; i++) {
					x = 20 + Math.round(Math.random() * 60);
					y = 10 + Math.round(Math.random() * 45);
					if (distance(system.ball.x, system.ball.y, system.target.x, system.target.y) > 20) {
						i = 6;
					}
				}
				system.target.x = x;
				system.target.y = y;
			}
			
		}
		
	}
	
	// RENDERING ON THE CANVAS
	
	function draw() {
		if (canvas.getContext) { // this makes sure we can draw on the canvas
			
			var ctx = canvas.getContext("2d");
			
			// Black background
			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			// Function for displaying text
			var dispMsg = function(text, font, fontsize, x, y, color, alignment) {
				ctx.font = (fontsize * canvas.height / 70) + "pt " + font;
				ctx.fillStyle = color;
				ctx.textAlign = alignment;
				if (alignment == "center") {
					ctx.fillText(text, x * (canvas.width / 100), (y * (canvas.height / 75)) + (fontsize * canvas.height / 140));
				} else if (alignment === "left") {
					ctx.fillText(text, x * (canvas.width / 100), (y * (canvas.height / 75)) + (fontsize * canvas.height / 70));
				} else if (alignment === "right") {
					ctx.fillText(text, x * (canvas.width / 100), (y * (canvas.height / 75)) + (fontsize * canvas.height / 70));
				}
			};
			
			// Function for converting degrees to radians for calculations
			var toRadians = function(deg) {
				return ((deg * Math.PI) / 180);
			};
			
			// Function for rotating a point - see https://en.wikipedia.org/wiki/Rotation_(mathematics)
			// based on this code: http://stackoverflow.com/questions/3162643/proper-trigonometry-for-rotating-a-point-around-the-origin
			// note: rotates counterclockwise, technically
			// ...                        angle in radians!
			var rotatePoint = function(cx, cy, angle, px, py) {
				var s = Math.sin(angle);
				var c = Math.cos(angle);
				
				px -= cx;
				py -= cy;
				
				var xnew = px * c - py * s;
				var ynew = px * s + py * c;
				
				var pxnew = xnew + cx;
				var pynew = ynew + cy;
				
				return {x: pxnew, y: pynew};
			};
			
			// Function for drawing the character
			var drawChar = function() {
				ctx.fillStyle = "#888";
				ctx.beginPath();
				ctx.moveTo(((system.character.x - 2) / 100 * canvas.width), (canvas.height / 75 * 60));
				ctx.lineTo(((system.character.x + 2) / 100 * canvas.width), (canvas.height / 75 * 60));
				ctx.lineTo(((system.character.x + 2) / 100 * canvas.width), canvas.height);
				ctx.lineTo(((system.character.x - 2) / 100 * canvas.width), canvas.height);
				ctx.fill();
			};
			
			// Function for drawing the panel
			var drawPanel = function() {
				// center of rotation for the panel
				var centerx = system.character.x;
				var centery = 62;
				// coordinates of the points of the panel assuming it is tilted upwards - x is relative to the character, y is based on grid
				var x1 = -8;
				var y1 = 56;
				var x2 = 8;
				var y2 = 56;
				var x3 = 8;
				var y3 = 60;
				var x4 = -8;
				var y4 = 60;
				
				var temp; // temporary coordinate used for rotation
				ctx.fillStyle = "#888";
				ctx.beginPath();
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x1, y1);
				ctx.moveTo((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x2, y2);
				ctx.lineTo((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x3, y3);
				ctx.lineTo((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x4, y4);
				ctx.lineTo((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width));
				ctx.fill();
			};
			
			// Function for drawing the white ball
			var drawBall = function() {
				ctx.fillStyle = "#FFF";
				ctx.beginPath();
				ctx.arc(((system.ball.x / 100) * canvas.width), ((system.ball.y / 75) * canvas.height), ((canvas.width / 100) * system.ball.size), 0, (Math.PI * 2));
				ctx.fill();
			};
			
			// Function for drawing the target
			var drawTarget = function() {
				ctx.fillStyle = "#666";
				ctx.beginPath();
				ctx.arc(((system.target.x / 100) * canvas.width), ((system.target.y / 75) * canvas.height), ((canvas.width / 100) * system.target.size), 0, (Math.PI * 2));
				ctx.fill();
				ctx.fillStyle = "#AAA";
				ctx.beginPath();
				ctx.arc(((system.target.x / 100) * canvas.width), ((system.target.y / 75) * canvas.height), ((canvas.width / 100) * (system.target.size * 2/3)), 0, (Math.PI * 2));
				ctx.fill();
				ctx.fillStyle = "#666";
				ctx.beginPath();
				ctx.arc(((system.target.x / 100) * canvas.width), ((system.target.y / 75) * canvas.height), ((canvas.width / 100) * (system.target.size * 1/3)), 0, (Math.PI * 2));
				ctx.fill();
			};
			
			// Function for drawing the score
			var drawScore = function() {
				dispMsg(system.score.current, "Trebuchet MS", 45, 100, 25, "rgba(255, 255, 255, " + (0.2 + ((system.score.cooldown / 60) * 0.8)) + ")", "right");
				dispMsg("High Score:", "Trebuchet MS", 3, 1, 4, "#FFF", "left");
				dispMsg(system.score.high, "Trebuchet MS", 6, 23, 1, "#FFF", "left");
			};
			
			// Function for drawing certain points for debugging
			var drawDebugPoints = function() {
				// center of rotation for the panel
				var centerx = system.character.x;
				var centery = 62;
				// coordinates of the panel's collision assuming it is tilted upwards - x is relative to the character, y is based on grid
				var x1 = -8;
				var y1 = 56;
				var x2 = -4;
				var y2 = 56;
				var x3 = 0;
				var y3 = 56;
				var x4 = 4;
				var y4 = 56;
				var x5 = 8;
				var y5 = 56;
				
				var temp;
				ctx.fillStyle = "#0000FF";
				ctx.beginPath();
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x1, y1);
				ctx.arc((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width), (2.5 / 100 * canvas.width), 0, (Math.PI * 2));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x2, y2);
				ctx.arc((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width), (2.5 / 100 * canvas.width), 0, (Math.PI * 2));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x3, y3);
				ctx.arc((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width), (2.5 / 100 * canvas.width), 0, (Math.PI * 2));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x4, y4);
				ctx.arc((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width), (2.5 / 100 * canvas.width), 0, (Math.PI * 2));
				temp = rotatePoint(centerx, centery, toRadians(system.panel.tilt - 90), system.character.x + x5, y5);
				ctx.arc((temp.x / 100 * canvas.width), (temp.y / 100 * canvas.width), (2.5 / 100 * canvas.width), 0, (Math.PI * 2));
				ctx.fill();
			};
			
			// Function for drawing debug info
			var drawDebugInfo = function() {
				dispMsg("FPS: " + ((Math.round(currentfps * 10)) / 10), "Trebuchet MS", 2, 100, 6.5, "#FFF", "right");
				if (isiPad) {
					// dispMsg("Using iPad", "Trebuchet MS", 2, 100, 9, "#FFF", "right");
					// dispMsg("YAccel: " + ((Math.round(ioscontrols.yaccel * 10)) / 10), "Trebuchet MS", 2, 100, 11.5, "#FFF", "right");
					// dispMsg("Tapping?: " + ioscontrols.tapping, "Trebuchet MS", 2, 100, 14, "#FFF", "right");
				} else {
					// dispMsg("Not using iPad", "Trebuchet MS", 2, 100, 9, "#FFF", "right");
				}
				dispMsg("v. 2.1_05 (b26)", "Trebuchet MS", 3, 100, 1, "#FFF", "right");
				// dispMsg("sys.char.dx: " + ((Math.round(system.character.dx * 10)) / 10), "Trebuchet MS", 24, 100, 50, "#FFF");
				// dispMsg("Mouse X: " + controls.mouseX + " (" + ((Math.round((controls.mouseX / (canvas.width / 100)) * 10)) / 10) + ")", "Trebuchet MS", 3, 1, 5, "#FFF");
				// dispMsg("Mouse Y: " + controls.mouseY + " (" + ((Math.round((controls.mouseY / (canvas.height / 75)) * 10)) / 10) + ")", "Trebuchet MS", 3, 1, 9, "#FFF");
				// dispMsg("BallDx: " + ((Math.round(system.ball.dx * 10)) / 10), "Trebuchet MS", 3, 1, 17, "#FFF");
				// dispMsg("Colliding?: " + system.ball.colliding, "Trebuchet MS", 3, 1, 13, "#FFF");
			}
			
			// Function for drawing a debug grid
			var drawDebugGrid = function() {
				ctx.strokeStyle = "#FFF";
				ctx.beginPath();
				var i;
				for (i = 1; i <= 100; i++) {
					ctx.moveTo((canvas.width / 100) * i, 0);
					ctx.lineTo((canvas.width / 100) * i, canvas.height);
				}
				for (i = 1; i <=75; i++) {
					ctx.moveTo(0, (canvas.height / 75) * i);
					ctx.lineTo(canvas.width, (canvas.height / 75) * i);
				}
				ctx.stroke();
			}
			
			// Displays intro messages
			if (system.stage == 0) {
				dispMsg(intro.messages[intro.currentMsg], "Trebuchet MS", 4, intro.msgPos, 37.5, "rgba(255, 255, 255, " + (intro.msgOpacity / 100) + ")", "center");
			}
			
			//  Displays menu text
			if (system.stage == 1) {
				dispMsg("fast catch", "Trebuchet MS", 10, 50, 28, "rgba(255, 255, 255, " + (title.titleOpacity / 100) + ")", "center");
				dispMsg("start", "Trebuchet MS", 6, 50, 45, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
				if (isiPad) {
					dispMsg("(tap the screen)", "Trebuchet MS", 3, 50, 52, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
				} else {
					dispMsg("(press space)", "Trebuchet MS", 3, 50, 52, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
				}
			}
			
			// Displays instructions
			if (system.stage == 2) {
				if (isiPad) {
					dispMsg("Hold your iPad sideways", "Trebuchet MS", 4, 50, 20, "#FFF", "center");
					dispMsg("(home button to the right →)", "Trebuchet MS", 4, 50, 30, "#FFF", "center");
					dispMsg("Tilt your iPad to move the panel", "Trebuchet MS", 4, 50, 40, "#FFF", "center");
					dispMsg("(tap the screen to play)", "Trebuchet MS", 3, 50, 50, "#FFF", "center");
				} else {
					dispMsg("Use ← and → to move", "Trebuchet MS", 4, 50, 25, "#FFF", "center");
					dispMsg("Use ↑ and ↓ to tilt your paddle", "Trebuchet MS", 4, 50, 35, "#FFF", "center");
					dispMsg("(press space to play)", "Trebuchet MS", 3, 50, 45, "#FFF", "center");
				}
			}
			
			// Display game information
			if (system.stage == 3) {
				drawScore();
				drawTarget();
				drawChar();
				drawPanel();
				drawBall();
				if (debug) {
					// drawDebugPoints();
				}
			}
			
			// Displays debug information
			if (debug) {
				// drawDebugGrid();
				drawDebugInfo();
			}
			
		}
	}
	
	function play(sound) {
		if (window.HTMLAudioElement) {
			var snd = new Audio("");
			if (snd.canPlayType("audio/ogg")) {
				snd = new Audio(sound + ".ogg");
			}
			if (snd.canPlayType("audio/mp3")) {
				snd = new Audio(sound + ".mp3");
			}
			snd.play();
		} else {
			console.log("HTMLAudioElement didn't work.");
		}
	}
	
}

window.onload = game;