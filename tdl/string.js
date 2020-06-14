/**
 * @fileoverview This file contains objects strings.
 */

tdl.provide('tdl.string');

/**
 * A module for string.
 * @namespace
 */
tdl.string = tdl.string || {};

/**
 * Whether a haystack ends with a needle.
 * @param {string} haystack String to search
 * @param {string} needle String to search for.
 * @param {boolean} True if haystack ends with needle.
 */
tdl.string.endsWith = function(haystack, needle) {
  return haystack.substr(haystack.length - needle.length) === needle;
};

/**
 * Whether a haystack starts with a needle.
 * @param {string} haystack String to search
 * @param {string} needle String to search for.
 * @param {boolean} True if haystack starts with needle.
 */
tdl.string.startsWith = function(haystack, needle) {
  return haystack.substr(0, needle.length) === needle;
};

/**
 * Converts a non-homogenious array into a string.
 * @param {!Array.<*>} args Args to turn into a string
 */
tdl.string.argsToString = function(args) {
  var lastArgWasNumber = false;
  var numArgs = args.length;
  var strs = [];
  for (var ii = 0; ii < numArgs; ++ii) {
    var arg = args[ii];
    if (arg === undefined) {
      strs.push('undefined');
    } else if (typeof arg == 'number') {
      if (lastArgWasNumber) {
        strs.push(", ");
      }
      if (arg == Math.floor(arg)) {
        strs.push(arg.toFixed(0));
      } else {
      strs.push(arg.toFixed(3));
      }
      lastArgWasNumber = true;
    } else if (window.Float32Array && arg instanceof Float32Array) {
      // TODO(gman): Make this handle other types of arrays.
      strs.push(tdl.string.argsToString(arg));
    } else {
      strs.push(arg.toString());
      lastArgWasNumber = false;
    }
  }
  return strs.join("");
};

/**
 * Converts an object into a string. Similar to JSON.stringify but just used
 * for debugging.
 */
tdl.string.objToString = function(obj, opt_prefix) {
  var strs = [];

  function objToString(obj, opt_prefix) {
    opt_prefix = opt_prefix || "";
    if (typeof obj == 'object') {
      if (obj.length !== undefined) {
        for (var ii = 0; ii < obj.length; ++ii) {
          objToString(obj[ii], opt_prefix + "[" + ii + "]");
        }
      } else {
        for (var name in obj) {
          objToString(obj[name], opt_prefix + "." + name);
        }
      }
    } else {
      strs.push(tdl.string.argsToString([opt_prefix, ": ", obj]));
    }
  }

  objToString(obj);

  return strs.join("\n");
};


