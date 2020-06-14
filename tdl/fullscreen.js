/**
 * @fileoverview This file contains misc functions to deal with
 *               fullscreen.
 */

tdl.provide('tdl.fullscreen');

/**
 * A module for misc.
 * @namespace
 */
tdl.fullscreen = tdl.fullscreen || {};

tdl.fullscreen.requestFullScreen = function(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  }
};

tdl.fullscreen.cancelFullScreen = function(element) {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
};

tdl.fullscreen.onFullScreenChange = function(element, callback) {
  var isFullScreen = function() {
    return document.fullscreenElement || document.mozFullScreenElement ||
           document.webkitFullscreenElement || document.msFullscreenElement ||
           document.mozFullScreen || document.webkitIsFullScreen;
  };
  document.addEventListener('fullscreenchange', function(event) {
      callback(isFullScreen());
    });
  element.addEventListener('webkitfullscreenchange', function(event) {
      callback(isFullScreen());
    });
  document.addEventListener('mozfullscreenchange', function(event) {
      callback(isFullScreen());
    });
};


