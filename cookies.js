function Cookies() {}

Cookies.prototype.createCookie = function (score) {
  var currentHigh = this.getCookie();
  if (currentHigh) {
    document.cookie = "score=" + encodeURI(currentHigh) + "; expires = Thu, 01 Jan 1970 00:00:01 GMT; path=/";
  }
  var date = new Date();
  date.setDate(date.getDate() + 365); // Adds one year
  document.cookie = "score=" + encodeURI(score) + "; expires = " + date.toGMTString() + "; path=/";
};

Cookies.prototype.getCookie = function () {
  var cookie = document.cookie.match('(^|;) ?score=([^;]*)(;|$)');
  if (cookie) {
    return decodeURI(cookie[2]);
  } else {
    return false;
  }
};