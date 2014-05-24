function Math2() {}

// Converts radians to degrees
Math2.prototype.toDegrees = function (rad) {
  return ((rad * 180) / Math.PI);
};

// Converts degrees to radians
Math2.prototype.toRadians = function (deg) {
  return ((deg * Math.PI) / 180);
};

// Determines the distance between two coordinates
Math2.prototype.distance = function (x1, y1, x2, y2) {
  return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
};

// Rotates a point counterclockwise around another point
/*
See https://en.wikipedia.org/wiki/Rotation_(mathematics) for more info
Based on this code: http://stackoverflow.com/questions/3162643/proper-trigonometry-for-rotating-a-point-around-the-origin
cx - center x
cy - center y
angle - angle (counterclockwise) in radians
px - point x
py - point y
*/
Math2.prototype.rotatePoint = function (cx, cy, angle, px, py) {
  var s = Math.sin(angle);
  var c = Math.cos(angle);

  px -= cx;
  py -= cy;

  var xnew = px * c - py * s;
  var ynew = px * s + py * c;

  var pxnew = xnew + cx;
  var pynew = ynew + cy;

  return {
    x: pxnew,
    y: pynew
  };
};