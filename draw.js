function Draw(canvas, data) {
  this.data = data;
  
  this.font = "Ubuntu";

  this.colors = {
    BLACK: "rgba(0, 0, 0, 1)",
    DARKGRAY: "rgba(85, 85, 85, 1)",
    LIGHTGRAY: "rgba(170, 170, 170, 1)",
    WHITE: "rgba(255, 255, 255, 1)"
  };

  this.mathx = new Math2();

  this.canvas = canvas;

  this.ctx = this.canvas.getContext("2d");
}

// Display a black background
Draw.prototype.fillBG = function () {
  this.ctx.fillStyle = this.colors.BLACK;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

// Displays text based on a variety of parameters
/*
- text: the text that appears
- font: the font that is used (mostly Trebuchet MS in my game)
- fontsize: the fontsize based on the screen-unit system I have, ex.
  fontsize 50 would take up half of the screen, 10 would take up 1/10
- x: the x position of the text (in screen-units)
- y: the y position of the text (in screen-units)
- color: the color of the text (usually white)
- alignment: the alignment of the text: "left", "right", or "center"
*/
Draw.prototype.dispMsg = function (text, font, fontsize, x, y, color, alignment) {
  this.ctx.font = (fontsize * this.canvas.height / 70) + "pt " + font;
  this.ctx.fillStyle = color;
  this.ctx.textAlign = alignment;
  if (alignment === "center") {
    this.ctx.fillText(text, x * (this.canvas.width / 100), (y * (this.canvas.height / 75)) + (fontsize * this.canvas.height / 140));
  } else if (alignment === "left") {
    this.ctx.fillText(text, x * (this.canvas.width / 100), (y * (this.canvas.height / 75)) + (fontsize * this.canvas.height / 70));
  } else if (alignment === "right") {
    this.ctx.fillText(text, x * (this.canvas.width / 100), (y * (this.canvas.height / 75)) + (fontsize * this.canvas.height / 70));
  }
};

// Draws the character
Draw.prototype.drawChar = function () {
  var character = this.data.character;

  this.ctx.fillStyle = this.colors.DARKGRAY;
  this.ctx.beginPath();
  this.ctx.moveTo(((character.x - 2) / 100 * this.canvas.width), (this.canvas.height / 75 * 60));
  this.ctx.lineTo(((character.x + 2) / 100 * this.canvas.width), (this.canvas.height / 75 * 60));
  this.ctx.lineTo(((character.x + 2) / 100 * this.canvas.width), this.canvas.height);
  this.ctx.lineTo(((character.x - 2) / 100 * this.canvas.width), this.canvas.height);
  this.ctx.fill();
};

// Draws the paddle
Draw.prototype.drawPaddle = function () {
  var character = this.data.character;
  var paddle = this.data.paddle;

  // Center of the paddle (for rotation)
  var centerx = character.x;
  var centery = 62;

  // Coordinates of the paddle's points assuming it is tilted
  // upwards - x is relative to the character, y is based on grid
  var x1 = -8;
  var y1 = 56;
  var x2 = 8;
  var y2 = 56;
  var x3 = 8;
  var y3 = 60;
  var x4 = -8;
  var y4 = 60;

  var temp; // temporary coordinate used for rotation
  this.ctx.fillStyle = this.colors.DARKGRAY;
  this.ctx.beginPath();
  temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(paddle.tilt - 90), character.x + x1, y1);
  this.ctx.moveTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));
  temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(paddle.tilt - 90), character.x + x2, y2);
  this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));
  temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(paddle.tilt - 90), character.x + x3, y3);
  this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));
  temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(paddle.tilt - 90), character.x + x4, y4);
  this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));
  this.ctx.fill();
};

// Draws the balls
Draw.prototype.drawBalls = function () {
  var balls = this.data.balls;

  for (var i = 0; i < balls.data.length; i++) {
    var ballOpacity = (1 - (balls.data[i].fadeFrame / balls.data[i].fadeFrameTotal));
    var ballX = balls.data[i].x;
    var ballY = balls.data[i].y;
    var ballSize = balls.data[i].size;
    this.ctx.fillStyle = "rgba(255, 255, 255, " + ballOpacity + ")";
    this.ctx.beginPath();
    this.ctx.arc(((ballX / 100) * this.canvas.width), ((ballY / 75) * this.canvas.height), ((ballSize / 100) * this.canvas.width), 0, (Math.PI * 2));
    this.ctx.fill();
  }
};

// Draws the target
Draw.prototype.drawTarget = function () {
  var target = this.data.target;

  this.ctx.fillStyle = this.colors.DARKGRAY;
  this.ctx.beginPath();
  this.ctx.arc(((target.x / 100) * this.canvas.width), ((target.y / 75) * this.canvas.height), ((this.canvas.width / 100) * target.size), 0, (Math.PI * 2));
  this.ctx.fill();
  this.ctx.fillStyle = this.colors.LIGHTGRAY;
  this.ctx.beginPath();
  this.ctx.arc(((target.x / 100) * this.canvas.width), ((target.y / 75) * this.canvas.height), ((this.canvas.width / 100) * (target.size * 2 / 3)), 0, (Math.PI * 2));
  this.ctx.fill();
  this.ctx.fillStyle = this.colors.DARKGRAY;
  this.ctx.beginPath();
  this.ctx.arc(((target.x / 100) * this.canvas.width), ((target.y / 75) * this.canvas.height), ((this.canvas.width / 100) * (target.size * 1 / 3)), 0, (Math.PI * 2));
  this.ctx.fill();
};

// Draws the item box
Draw.prototype.drawItemBox = function () {
  var itemBox = this.data.itemBox;
  if (itemBox.appearing) {
    var direction = itemBox.direction;
    var centerx = itemBox.x;
    var centery = itemBox.y;
    var size = itemBox.size;
    var temp; // variable used for storing a temporary point
    var temp2; // variable used for storing another temp point

    this.ctx.fillStyle = this.colors.DARKGRAY;
    this.ctx.beginPath();

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.3 * size), centery - (size * 0.5));
    this.ctx.moveTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.3 * size), centery - (size * 0.5));
    this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.5 * size), centery - (size * 0.3));
    temp2 = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.5 * size), centery - (size * 0.5));
    this.ctx.quadraticCurveTo((temp2.x / 100 * this.canvas.width), (temp2.y / 100 * this.canvas.width), (temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.5 * size), centery + (size * 0.3));
    this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.3 * size), centery + (size * 0.5));
    temp2 = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx + (0.5 * size), centery + (size * 0.5));
    this.ctx.quadraticCurveTo((temp2.x / 100 * this.canvas.width), (temp2.y / 100 * this.canvas.width), (temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.3 * size), centery + (size * 0.5));
    this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.5 * size), centery + (size * 0.3));
    temp2 = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.5 * size), centery + (size * 0.5));
    this.ctx.quadraticCurveTo((temp2.x / 100 * this.canvas.width), (temp2.y / 100 * this.canvas.width), (temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.5 * size), centery - (size * 0.3));
    this.ctx.lineTo((temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    temp = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.3 * size), centery - (size * 0.5));
    temp2 = this.mathx.rotatePoint(centerx, centery, this.mathx.toRadians(direction), centerx - (0.5 * size), centery - (size * 0.5));
    this.ctx.quadraticCurveTo((temp2.x / 100 * this.canvas.width), (temp2.y / 100 * this.canvas.width), (temp.x / 100 * this.canvas.width), (temp.y / 100 * this.canvas.width));

    this.ctx.fill();

    this.dispMsg("?", this.font, (size * 0.75), centerx, centery, "#FFF", "center");
  }
};

// Draws the item display
Draw.prototype.drawItemDisplay = function () {
  this.ctx.strokeStyle = this.colors.WHITE;
  this.ctx.lineWidth = (0.5 / 100 * this.canvas.width);
  this.ctx.beginPath();
  this.ctx.moveTo((82 / 100 * this.canvas.width), (7 / 100 * this.canvas.width));
  this.ctx.lineTo((82 / 100 * this.canvas.width), (2 / 100 * this.canvas.width));
  this.ctx.lineTo((87 / 100 * this.canvas.width), (2 / 100 * this.canvas.width));
  this.ctx.moveTo((93 / 100 * this.canvas.width), (2 / 100 * this.canvas.width));
  this.ctx.lineTo((98 / 100 * this.canvas.width), (2 / 100 * this.canvas.width));
  this.ctx.lineTo((98 / 100 * this.canvas.width), (7 / 100 * this.canvas.width));
  this.ctx.moveTo((98 / 100 * this.canvas.width), (13 / 100 * this.canvas.width));
  this.ctx.lineTo((98 / 100 * this.canvas.width), (18 / 100 * this.canvas.width));
  this.ctx.lineTo((93 / 100 * this.canvas.width), (18 / 100 * this.canvas.width));
  this.ctx.moveTo((87 / 100 * this.canvas.width), (18 / 100 * this.canvas.width));
  this.ctx.lineTo((82 / 100 * this.canvas.width), (18 / 100 * this.canvas.width));
  this.ctx.lineTo((82 / 100 * this.canvas.width), (13 / 100 * this.canvas.width));
  this.ctx.stroke();

  var itemDisplay = this.data.itemDisplay;
  var randomItem;
  var opacity;
  if (itemDisplay.displayed === 0) {
    this.drawNoItem();
  } else if (itemDisplay.displayed === 1) {
    randomItem = itemDisplay.frame % 9;
    if (randomItem < 3) {
      this.drawTripleMultiplier();
    } else if (randomItem < 6) {
      this.drawTripleBalls();
    } else {
      this.drawMagnet();
    }
  } else if (itemDisplay.displayed === 2) {
    this.drawTripleMultiplier();
  } else if (itemDisplay.displayed === 3) {
    // Draw 3 white balls in a triangular formation
    if (itemDisplay.frame > 300) {
      opacity = (1 - ((600 - itemDisplay.frame) / 300));
      this.ctx.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
      this.drawTripleBalls();
    } else {
      itemDisplay.displayed = 0;
    }
  } else if (itemDisplay.displayed === 4) {
    this.drawMagnet();
  }
};

// Draws "no item" text
Draw.prototype.drawNoItem = function () {
  this.dispMsg("no", this.font, 3, 90, 7.5, this.colors.DARKGRAY, "center");
  this.dispMsg("item", this.font, 3, 90, 12.5, this.colors.DARKGRAY, "center");
};

// Draws "3x" text
Draw.prototype.drawTripleMultiplier = function () {
  this.dispMsg("3x", this.font, 8, 90, 10, this.colors.DARKGRAY, "center");
};

// Draws 3 white balls in a triangular formation
Draw.prototype.drawTripleBalls = function () {
  this.ctx.beginPath();
  this.ctx.arc(((90 / 100) * this.canvas.width), ((7 / 75) * this.canvas.height), ((2.5 / 100) * this.canvas.width), 0, (Math.PI * 2));
  this.ctx.fill();
  this.ctx.beginPath();
  this.ctx.arc(((86 / 100) * this.canvas.width), ((13 / 75) * this.canvas.height), ((2.5 / 100) * this.canvas.width), 0, (Math.PI * 2));
  this.ctx.fill();
  this.ctx.beginPath();
  this.ctx.arc(((94 / 100) * this.canvas.width), ((13 / 75) * this.canvas.height), ((2.5 / 100) * this.canvas.width), 0, (Math.PI * 2));
  this.ctx.fill();
};

// Draws magnet
Draw.prototype.drawMagnet = function () {
  this.ctx.fillStyle = this.colors.DARKGRAY;
  this.ctx.beginPath();
  this.ctx.arc(((90 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height), ((5 / 100) * this.canvas.width), Math.PI, (Math.PI * 2));
  this.ctx.moveTo(((95 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height));
  this.ctx.lineTo(((94 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((92 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((93 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height));
  this.ctx.moveTo(((87 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height));
  this.ctx.lineTo(((88 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((86 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((85 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height));
  this.ctx.fill();

  this.ctx.fillStyle = this.colors.BLACK;
  this.ctx.beginPath();
  this.ctx.arc(((90 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height), ((3 / 100) * this.canvas.width), Math.PI, (Math.PI * 2));
  this.ctx.fill();

  this.ctx.fillStyle = this.colors.WHITE;
  this.ctx.beginPath();
  this.ctx.moveTo(((85.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));
  this.ctx.lineTo(((86 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((88 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((87.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));
  this.ctx.lineTo(((85.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));

  this.ctx.moveTo(((94.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));
  this.ctx.lineTo(((94 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((92 / 100) * this.canvas.width), ((15 / 75) * this.canvas.height));
  this.ctx.lineTo(((92.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));
  this.ctx.lineTo(((94.5 / 100) * this.canvas.width), ((12.5 / 75) * this.canvas.height));
  this.ctx.fill();
};

// Draws the timer
Draw.prototype.drawTimer = function () {
  var itemDisplay = this.data.itemDisplay;
  if (itemDisplay.frame > 0 && (itemDisplay.current === 2 || itemDisplay.current === 4)) {
    this.dispMsg(Math.ceil(itemDisplay.frame / 60), this.font, 4, 76, 10, "#FFF", "center");
    this.ctx.fillStyle = this.colors.WHITE;
    this.ctx.beginPath();
    this.ctx.arc(((68 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height), ((this.canvas.width / 100) * 4), 0, (Math.PI * 2));
    this.ctx.fill();
    this.ctx.fillStyle = this.colors.DARKGRAY;
    this.ctx.beginPath();
    this.ctx.arc(((68 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height), ((this.canvas.width / 100) * 3.5), 0, (Math.PI * 2));
    this.ctx.fill();
    this.ctx.fillStyle = this.colors.BLACK;
    this.ctx.beginPath();
    this.ctx.arc(((68 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height), ((this.canvas.width / 100) * 3.5), (Math.PI * 1.5), (Math.PI * 1.5) + ((Math.PI * 2) * ((0 - itemDisplay.frame) / 600)), false);
    this.ctx.lineTo(((68 / 100) * this.canvas.width), ((10 / 75) * this.canvas.height));
    this.ctx.fill();
  }
};

// Draws the particles
Draw.prototype.drawParticles = function () {
  var particles = this.data.particles;
  var i;
  for (i = 0; i < particles.data.length; i++) {
    var renderx = (particles.data[i].x / 100) * this.canvas.width;
    var rendery = (particles.data[i].y / 100) * this.canvas.width;
    var renderw = (particles.width / 100) * this.canvas.width;
    this.ctx.fillStyle = this.colors.WHITE;
    this.ctx.fillRect(renderx, rendery, renderw, renderw);
  }
};

// Draws the scores
Draw.prototype.drawScore = function () {
  var score = this.data.score;
  this.dispMsg(score.current, this.font, 40, 100, 30, "rgba(255, 255, 255, " + (0.2 + ((score.frame / 60) * 0.8)) + ")", "right");
  this.dispMsg("high score:", this.font, 3, 1, 4, this.colors.WHITE, "left");
  this.dispMsg(score.high, this.font, 6, 23, 1, this.colors.WHITE, "left");
};

// Draws the high score
Draw.prototype.drawHSMsg = function () {
  var score = this.data.score;
  var progress;
  if (score.HSframe > 0) {
    progress = (score.HSlength - score.HSframe) / score.HSlength;
    this.dispMsg("new high score!", this.font, 8, 50, 33.5 - (progress * 10), "rgba(255, 255, 255, " + (1 - progress) + ")", "center");
  }
};

// Draws the pause overlay
Draw.prototype.drawPauseOverlay = function () {
  this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.dispMsg("paused", this.font, 8, 50, 30, this.colors.WHITE, "center");
  if (this.isiOS) {
    this.dispMsg("(double tap to continue)", this.font, 3, 50, 40, this.colors.WHITE, "center");
  } else {
    this.dispMsg("(press space to continue)", this.font, 3, 50, 40, this.colors.WHITE, "center");
  }
};

// Draws debug info
Draw.prototype.drawDebugInfo = function () {
  this.dispMsg("fps: " + ((Math.round(this.data.currentfps * 10)) / 10), this.font, 2, 0, 72.5, this.colors.WHITE, "left");
};

// Draws debug grid
Draw.prototype.drawDebugGrid = function () {
  this.ctx.strokeStyle = this.colors.WHITE;
  this.ctx.beginPath();
  var i;
  for (i = 1; i <= 100; i++) {
    this.ctx.moveTo((this.canvas.width / 100) * i, 0);
    this.ctx.lineTo((this.canvas.width / 100) * i, this.canvas.height);
  }
  for (i = 1; i <= 75; i++) {
    this.ctx.moveTo(0, (this.canvas.height / 75) * i);
    this.ctx.lineTo(this.canvas.width, (this.canvas.height / 75) * i);
  }
  this.ctx.stroke();
};

// Draws intro messages
Draw.prototype.drawIntro = function () {
  var intro = this.data.intro;
  this.dispMsg(intro.messages[intro.currentMsg], this.font, 4, intro.msgPos, 37.5, "rgba(255, 255, 255, " + (intro.msgOpacity / 100) + ")", "center");
  if (this.data.score.high > 10) { // if the user has played before...
    if (this.isiOS) {
      this.dispMsg("(tap to skip)", this.font, 3, 98, 70, this.colors.WHITE, "right");
    } else {
      this.dispMsg("(press space to skip)", this.font, 3, 98, 70, this.colors.WHITE, "right");
    }
  }
};

// Displays menu text
Draw.prototype.drawMenu = function () {
  var title = this.data.title;
  this.dispMsg("fast catch", this.font, 10, 50, 28, "rgba(255, 255, 255, " + (title.titleOpacity / 100) + ")", "center");
  this.dispMsg("start", this.font, 6, 50, 45, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
  if (this.isiOS) {
    this.dispMsg("(tap the screen)", this.font, 3, 50, 52, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
  } else {
    this.dispMsg("(press space)", this.font, 3, 50, 52, "rgba(255, 255, 255, " + (title.buttonOpacity / 100) + ")", "center");
  }
};

// Displays instructions
Draw.prototype.drawInstructions = function () {
  if (this.isiOS) {
    this.dispMsg("hold your iPad sideways", this.font, 4, 50, 20, this.colors.WHITE, "center");
    this.dispMsg("tilt your iPad to move the paddle", this.font, 4, 50, 30, this.colors.WHITE, "center");
    this.dispMsg("double tap to pause", this.font, 4, 50, 40, this.colors.WHITE, "center");
    this.dispMsg("(tap the screen to start)", this.font, 3, 50, 50, this.colors.WHITE, "center");
  } else {
    this.dispMsg("use ← and → to move", this.font, 4, 50, 25, this.colors.WHITE, "center");
    this.dispMsg("press space to pause", this.font, 4, 50, 35, this.colors.WHITE, "center");
    this.dispMsg("(press space to start)", this.font, 3, 50, 45, this.colors.WHITE, "center");
  }
};

// Makes the screen shake
Draw.prototype.shake = function () {
  if (!this.data.scaled && this.data.shake === 1) {
    this.ctx.save();
    this.ctx.scale(1.02, 1.02);
    this.ctx.translate(0 - ((this.canvas.width / 100) * 1), 0 - ((this.canvas.width / 100) * 1));
    this.data.scaled = true;
  }

  if (this.data.shake === 3) {
    this.ctx.scale(1.02, 1.02);
    this.ctx.translate(0 - ((this.canvas.width / 100) * 1), 0 - ((this.canvas.width / 100) * 1));
  }

  if (this.data.shake === 5) {
    this.ctx.scale(0.98, 0.98);
    this.ctx.translate(((this.canvas.width / 100) * 1), ((this.canvas.width / 100) * 1));
  }

  if (this.data.scaled && this.data.shake === 0) {
    this.ctx.restore();
    this.data.scaled = false;
  }
};

// Updates the canvas
Draw.prototype.render = function () {
  this.fillBG();

  this.shake();

  if (this.data.stage === 0) {
    this.drawIntro();
  }
  
  if (this.data.stage === 1) {
    this.drawMenu();
  }

  if (this.data.stage === 2) {
    this.drawInstructions();
  }

  if (this.data.stage === 3) {
    this.drawScore();
    this.drawItemDisplay();
    this.drawTimer();
    this.drawTarget();
    this.drawItemBox();
    this.drawPaddle();
    this.drawChar();
    this.drawBalls();
    this.drawParticles();
    this.drawHSMsg();
    if (this.paused) {
      this.drawPauseOverlay();
    }
  }

  this.drawDebugInfo();
  // this.drawDebugGrid();
};