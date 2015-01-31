function Ball(x, y, dx, dy) {
  this.x = x; // x position
  this.y = y; // y position
  this.dx = dx; // x velocity
  this.dy = dy; // y velocity
  this.direction = 0; // direction (degrees)
  this.colliding = false; // collision with paddle
  this.cooldown = 0; // 5 frame cooldown for testing collisions
  this.gravity = -0.05; // affects dy, affected by gameSpeed
  this.size = 3.5; // size
  this.bounciness = 2.2; // determines velocity after collision
  this.fadeIn = true; // ball is respawning?
  this.fadeFrame = 8; // used if ball is respawning
  this.fadeFrameTotal = 8; // used if ball is respawning
}