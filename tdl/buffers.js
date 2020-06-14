/**
 * @fileoverview This file contains objects to deal with WebGL
 *               buffers.
 */

tdl.provide('tdl.buffers');

/**
 * A module for buffers.
 * @namespace
 */
tdl.buffers = tdl.buffers || {};

tdl.buffers.Buffer = function(array, opt_target) {
  var target = opt_target || gl.ARRAY_BUFFER;
  var buf = gl.createBuffer();
  this.target = target;
  this.buf = buf;
  this.set(array);
  this.numComponents_ = array.numComponents;
  this.numElements_ = array.numElements;
  this.totalComponents_ = this.numComponents_ * this.numElements_;
  if (array.buffer instanceof Float32Array) {
    this.type_ = gl.FLOAT;
    this.normalize_ = false;
  } else if (array.buffer instanceof Uint8Array) {
    this.type_ = gl.UNSIGNED_BYTE;
    this.normalize_ = true;
  } else if (array.buffer instanceof Int8Array) {
    this.type_ = gl.BYTE;
    this.normalize_ = true;
  } else if (array.buffer instanceof Uint16Array) {
    this.type_ = gl.UNSIGNED_SHORT;
    this.normalize_ = true;
  } else if (array.buffer instanceof Int16Array) {
    this.type_ = gl.SHORT;
    this.normalize_ = true;
  } else {
    throw("unhandled type:" + (typeof array.buffer));
  }
};

tdl.buffers.Buffer.prototype.set = function(array, opt_usage) {
  gl.bindBuffer(this.target, this.buf);
  gl.bufferData(this.target, array.buffer, opt_usage || gl.STATIC_DRAW);
}

tdl.buffers.Buffer.prototype.setRange = function(array, offset) {
  gl.bindBuffer(this.target, this.buf);
  gl.bufferSubData(this.target, offset, array);
}

tdl.buffers.Buffer.prototype.type = function() {
  return this.type_;
};

tdl.buffers.Buffer.prototype.numComponents = function() {
  return this.numComponents_;
};

tdl.buffers.Buffer.prototype.numElements = function() {
  return this.numElements_;
};

tdl.buffers.Buffer.prototype.totalComponents = function() {
  return this.totalComponents_;
};

tdl.buffers.Buffer.prototype.buffer = function() {
  return this.buf;
};

tdl.buffers.Buffer.prototype.stride = function() {
  return 0;
};

tdl.buffers.Buffer.prototype.normalize = function() {
  return this.normalize_;
}

tdl.buffers.Buffer.prototype.offset = function() {
  return 0;
};


