/**
 * @fileoverview This file contains objects to deal with logging.
 */

tdl.provide('tdl.log');

tdl.require('tdl.string');

/**
 * A module for log.
 * @namespace
 */
tdl.log = tdl.log || {};


/**
 * Wrapped logging function.
 * @param {*} msg The message to log.
 */
tdl.log = function() {
  var str = tdl.string.argsToString(arguments);
  if (window.console && window.console.log) {
    window.console.log(str);
  } else if (window.dump) {
    window.dump(str + "\n");
  }
};

/**
 * Wrapped logging function.
 * @param {*} msg The message to log.
 */
tdl.error = function() {
  var str = tdl.string.argsToString(arguments);
  if (window.console) {
    if (window.console.error) {
      window.console.error(str);
    } else if (window.console.log) {
      window.console.log(str);
    }
  } else if (window.dump) {
    window.dump(str + "\n");
  }
};

/**
 * Dumps an object to the console.
 *
 * @param {!Object} obj Object to dump.
 * @param {string} opt_prefix string to prefix each value with.
 */
tdl.dumpObj = function(obj, opt_prefix) {
  tdl.log(tdl.string.objToString(obj, opt_prefix));
};


