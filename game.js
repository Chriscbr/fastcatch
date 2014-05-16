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
	function mouseMove(evt) {
		
		if (evt.offsetX || evt.offsetX == 0) { // IE, Opera 
			controls.mouseX = evt.offsetX;
			controls.mouseY = evt.offsetY;
		} else if (evt.layerX || evt.layerX == 0) { // Chrome, Firefox, Safari(?)
			controls.mouseX = evt.layerX;
			controls.mouseY = evt.layerY;
		}
		
		/* original version
		if (evt.layerX || evt.layerX == 0) { // Firefox
			controls.mouseX = evt.layerX;
			controls.mouseY = evt.layerY;
		} else if (evt.offsetX || evt.offsetX == 0) { // Opera
			controls.mouseX = evt.offsetX;
			controls.mouseY = evt.offsetY;
		}
		*/
		
	}
	
	function mouseDown() {
		
		controls.mouseDown = true;
		
	}
	
	function mouseUp() {
		
		controls.mouseDown = false;
		
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
			size: 3.5 // constant - ball radius (in terms of screen-units)
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
				if (controls.space == true) {
					system.stage = 2;
				}
			}
		}
		
		// 2 - instructions
		if (system.stage == 2) {
			if (instructions.unpressed == false) {
				if (controls.space == false) {
					instructions.unpressed = true;
				}
			} else if (instructions.unpressed) {
				if (controls.space == true) {
					instructions.repressed = true;
					system.stage = 3;
				}
			}
		}
		
		// 3 - main game
		if (system.stage == 3) {
			
			// character updates
			if (controls.right == true) {
				system.character.dx += system.character.speed;
			}
			if (controls.left == true) {
				system.character.dx -= system.character.speed;
			}
			system.character.dx *= system.character.friction;
			system.character.x += system.character.dx;
			
			if (system.character.x > 100) {
				system.character.x = 100;
			}
			if (system.character.x < 0) {
				system.character.x = 0;
			}
			
			// panel updates
			if (controls.up == true) {
				system.panel.tilt += system.panel.speed;
			}
			if (controls.down == true) {
				system.panel.tilt -= system.panel.speed;
			}
			
			if (system.panel.tilt > 180) {
				system.panel.tilt = 180;
			}
			if (system.panel.tilt < 0) {
				system.panel.tilt = 0;
			}
			
			// ball updates
			system.ball.dy += system.ball.gravity;
			
			system.ball.x += system.ball.dx;
			system.ball.y -= system.ball.dy;
			
			if (system.ball.x > 100) {
				system.ball.x = 100;
				system.ball.dx *= -1;
			}
			if (system.ball.x < 0) {
				system.ball.x = 0;
				system.ball.dx *= -1;
			}
			if (system.ball.y > 75) { //death
				system.ball.x = 50;
				system.ball.y = 5;
				system.ball.dy = 0;
				system.ball.dx = 0;
				system.panel.tilt = 90;
				system.character.x = 50;
				system.character.dx = 0;
			}
			
			var toDegrees = function(rad) {
				return ((rad * 180) / Math.PI);
			};
			var toRadians = function(deg) {
				return ((deg * Math.PI) / 180);
			};
			var distance = function(x1, y1, x2, y2) {
				return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
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
			
			// collision detection
			
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
				var speed = 2.2;
				system.ball.direction = dir // + (dir - (180 - system.ball.direction));
				system.ball.dx = speed * (Math.sin(toRadians(system.ball.direction)));
				system.ball.dy = speed * (Math.cos(toRadians(system.ball.direction)));
			};
			
			if (system.ball.colliding) {
				bounce(system.panel.tilt - 90);
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
				} else {
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
				
				/*
				ctx.fillStyle = "#888";
				ctx.save();
				ctx.translate(((system.character.x / 100) * canvas.width) - (canvas.height / 10) + ((system.panel.tilt - 90) * (canvas.height / 1200)), (canvas.height * 0.75));
				ctx.translate((canvas.height / 10), (canvas.height / 40));
				ctx.rotate(Math.PI * ((system.panel.tilt - 90) / 180));
				ctx.fillRect((0 - (canvas.height / 10)), (0 - (canvas.height / 40)), (canvas.height / 5), (canvas.height / 20));
				ctx.restore();
				*/
			};
			
			// Function for drawing the white ball
			var drawBall = function() {
				ctx.fillStyle = "#FFF";
				ctx.beginPath();
				ctx.arc(((system.ball.x / 100) * canvas.width), ((system.ball.y / 75) * canvas.height), ((canvas.width / 100) * system.ball.size), 0, (Math.PI * 2));
				ctx.fill();
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
				/*
				var x = system.character.x + ((Math.sin(toRadians(system.panel.tilt - 90))) * (10 * (canvas.height / canvas.width)));
				var y = 80 - ((Math.cos(toRadians(system.panel.tilt - 90))) * 5);
				ctx.arc(((x / 100) * canvas.width), ((y / 100) * canvas.height), 5, 0, (Math.PI * 2));
				var x1 = x + ((Math.sin(toRadians(system.panel.tilt - 180))) * (8 * (canvas.height / canvas.width)));
				var y1 = y - ((Math.cos(toRadians(system.panel.tilt - 180))) * 8);
				ctx.arc(((x1 / 100) * canvas.width), ((y1 / 100) * canvas.height), 5, 0, (Math.PI * 2));
				var x2 = x + ((Math.sin(toRadians(system.panel.tilt - 180))) * (4 * (canvas.height / canvas.width)));
				var y2 = y - ((Math.cos(toRadians(system.panel.tilt - 180))) * 4);
				ctx.arc(((x2 / 100) * canvas.width), ((y2 / 100) * canvas.height), 5, 0, (Math.PI * 2));
				var x4 = x + ((Math.sin(toRadians(system.panel.tilt))) * (4 * (canvas.height / canvas.width)));
				var y4 = y - ((Math.cos(toRadians(system.panel.tilt))) * 4);
				ctx.arc(((x4 / 100) * canvas.width), ((y4 / 100) * canvas.height), 5, 0, (Math.PI * 2));
				var x5 = x + ((Math.sin(toRadians(system.panel.tilt))) * (8 * (canvas.height / canvas.width)));
				var y5 = y - ((Math.cos(toRadians(system.panel.tilt))) * 8);
				ctx.arc(((x5 / 100) * canvas.width), ((y5 / 100) * canvas.height), 5, 0, (Math.PI * 2));
				ctx.fill();
				*/
			};
			
			// Function for drawing debug info
			var drawDebugInfo = function() {
				dispMsg("FPS: " + ((Math.round(currentfps * 10)) / 10), "Trebuchet MS", 3, 1, 1, "#FFF", "left");
				dispMsg("v. 2.1_05 (b26)", "Trebuchet MS", 3, 70, 1, "#FFF", "left");
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
				dispMsg(intro.messages[intro.currentMsg], "Trebuchet MS Italic", 4, intro.msgPos, 37.5, "rgba(255, 255, 255, " + (intro.msgOpacity / 100) + ")", "center");
			}
			
			//  Displays menu text
			if (system.stage == 1) {
				dispMsg("fast catch", "Trebuchet MS", 10, 50, 28, "rgba(255, 255, 255, " + (title.titleOpacity / 100) + ")", "center");
				dispMsg("start", "Trebuchet MS", 6, 50, 45, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
				dispMsg("(press space)", "Trebuchet MS", 3, 50, 52, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
			}
			
			// Displays instructions
			if (system.stage == 2) {
				dispMsg("Use ← and → to move", "Trebuchet MS", 4, 50, 25, "#FFF", "center");
				dispMsg("Use ↑ and ↓ to tilt your paddle", "Trebuchet MS", 4, 50, 35, "#FFF", "center");
				dispMsg("(press space to play)", "Trebuchet MS", 3, 50, 45, "#FFF", "center");
			}
			
			// Display game information
			if (system.stage == 3) {
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

/* function game() {
	
	var fps = 60;
	var gamePaused = false;
	var clock = setInterval(gameLoop, 1000 / fps);
	
	var player = {
		x: 30,
		y: (document.height / 2) - 25,
		r: 25,
		vx: 5,
		vy: 0
		};
		
	// CONSTANTS
	var gravity = 720;
	var friction = 0.95;
	var jumpFriction = 0.5;
	var lrAccel = 30; // acceleration from pressing left or right
	var jumpAccel = -500;
	
	// KEY PRESSES
	var rightKey = false;
	var leftKey = false;
	var upKey = false;
	var downKey = false;
	var justPressedUp = false;
	
	var canvas = document.getElementById("myCanvas");
	canvas.width = document.width;
	canvas.height = document.height;
	document.addEventListener('keydown', keyDown, false);
	document.addEventListener('keyup', keyUp, false);
	
	//add detection of window resizing with window.resize?
	
	function keyDown(key) {
		if (key.keyCode == 80) {
			pauseGame();
		}
		
		if (key.keyCode == 37) {
			leftKey = true;
		}
		
		if (key.keyCode == 38) {
			if (upKey == false) {
				upKey = true;
				justPressedUp = true;
				window.setTimeout(resetJustPressedUp, 200);
			}
		}
		
		if (key.keyCode == 39) {
			rightKey = true;
		}
		
		if (key.keyCode == 40) {
			downKey = true;
		}
	}
	
	function keyUp(key) {
		
		if (key.keyCode == 37) {
			leftKey = false;
		}
		
		if (key.keyCode == 38) {
			upKey = false;
			justPressedUp = false;
		}
		
		if (key.keyCode == 39) {
			rightKey = false;
		}
		
		if (key.keyCode == 40) {
			downKey = false;
		}
		
	}
	
	function resetJustPressedUp() {
		justPressedUp = false;
	}
		
	function pauseGame() {
	
		if (!gamePaused) {
			gamePaused = true;
		} else if (gamePaused) {
			gamePaused = false;
		}
		
	}

	function gameLoop() {
		
		if (gamePaused == false) update();
		draw();
		if (gamePaused == true) pauseScreen();
		
	}
	
	function update() {
	
		player.x += (player.vx / fps);
		player.y += (player.vy / fps);
		player.vy += (gravity / fps);
		player.vx *= Math.pow(friction, 60 / fps);
		
		// Setting boundaries
		
		if (player.y > (canvas.height - player.r)) {
			player.y = canvas.height - player.r;
			player.vy = 0 - (player.vy * jumpFriction);
		}
		
		if (player.x < player.r) {
			player.x = player.r;
			player.vx = 0 - (player.vx * friction);
		}
		
		// other logic
		
		if (Math.abs(player.vy) < 0.001) {
			player.vy = 0;
		}
		
		if (player.y > (canvas.height - player.r - 5) && justPressedUp == true) {
			player.vy = jumpAccel;
		}
		
		if (rightKey == true) {
			player.vx += (lrAccel * (60 / fps));
		}
		
		if (leftKey == true) {
			player.vx -= (lrAccel * (60 / fps));
		}
	}
	
	function draw() {
	
		// Rendering the game
	
		if (canvas.getContext) {
		
			var ctx = canvas.getContext("2d");

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Red circle
			ctx.fillStyle = "#FF0000";
			ctx.beginPath();
			ctx.arc(player.x, player.y, player.r, 0, Math.PI*2, false);
			ctx.fill();

			// Inner circle 1
			ctx.fillStyle = "#FF3333";
			ctx.beginPath();
			ctx.arc(player.x + 5, player.y - 5, player.r - 7, 0, Math.PI*2, false);
			ctx.fill();

			// Dark red border
			ctx.strokeStyle = "#B20000";
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(player.x, player.y, player.r, 0, Math.PI*2, false);
			ctx.stroke();
			
			// Debug text
			
			ctx.font = "18pt Calibri";
			ctx.fillStyle = "#000";
			ctx.fillText("player.x: " + player.x, 20, 40);
			ctx.fillText("player.y: " + player.y, 20, 70);
			ctx.fillText("player.vx: " + player.vx, 20, 100);
			ctx.fillText("player.vy: " + player.vy, 20, 130);
			ctx.fillText("upKey: " + upKey, 20, 160);
			ctx.fillText("justPressedUp: " + justPressedUp, 20, 190);

		}
	}
	
	function pauseScreen() {
		
		//Rendering the pause menus
		
		if (canvas.getContext) {
			
			var ctx = canvas.getContext("2d");
			
			// Puts gray overlay over the game
			
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			// Draws dark gray box for a pause menu
			
			ctx.fillRect((canvas.width / 2) - 150, (canvas.height / 2) - 100, 300, 200);
			
			// Adds text "The game is currently paused."
			
			ctx.font = "24pt Calibri";
			ctx.fillStyle = "#FFF";
			ctx.fillText("PAUSE", (canvas.width / 2) - 40, (canvas.height / 2));
			
		}
		
	}
	
}

window.onload = game; */