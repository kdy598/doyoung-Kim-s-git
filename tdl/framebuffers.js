/**
 * @fileoverview This file contains objects to manage
 *               framebuffers.
 */

tdl.provide('tdl.framebuffers');

tdl.require('tdl.textures');

/**
 * A module for textures.
 * @namespace
 */
tdl.framebuffers = tdl.framebuffers || {};

tdl.framebuffers.createFramebuffer = function(width, height, opt_depth) {
  return new tdl.framebuffers.Framebuffer(width, height, opt_depth);
};

tdl.framebuffers.createCubeFramebuffer = function(size, opt_depth) {
  return new tdl.framebuffers.CubeFramebuffer(size, opt_depth);
};

tdl.framebuffers.BackBuffer = function(canvas) {
  this.depth = true;
  this.buffer = null;
};

tdl.framebuffers.BackBuffer.prototype.bind = function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
};

if (Object.prototype.__defineSetter__) {
tdl.framebuffers.BackBuffer.prototype.__defineGetter__(
    'width',
    function () {
      return gl.drawingBufferWidth || gl.canvas.width;
    }
);

tdl.framebuffers.BackBuffer.prototype.__defineGetter__(
    'height',
    function () {
      return gl.drawingBufferHeight || gl.canvas.height;
    }
);
}

// Use this where you need to pass in a framebuffer, but you really
// mean the backbuffer, so that binding it works as expected.
tdl.framebuffers.getBackBuffer = function(canvas) {
  return new tdl.framebuffers.BackBuffer(canvas)
};

tdl.framebuffers.Framebuffer = function(width, height, opt_depth) {
  this.width = width;
  this.height = height;
  this.depth = opt_depth;
  this.recoverFromLostContext();
};

tdl.framebuffers.Framebuffer.prototype.bind = function() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.width, this.height);
};

tdl.framebuffers.Framebuffer.unbind = function() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(
      0, 0,
      gl.drawingBufferWidth || gl.canvas.width,
      gl.drawingBufferHeight || gl.canvas.height);
};

tdl.framebuffers.Framebuffer.prototype.unbind = function() {
  tdl.framebuffers.Framebuffer.unbind();
};

tdl.framebuffers.Framebuffer.prototype.recoverFromLostContext = function() {
  var tex = new tdl.textures.SolidTexture([0,0,0,0]);
  this.initializeTexture(tex);

  var fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex.texture,
      0);

  if (this.depth) {
    if (gl.tdl.depthTexture) {
      var dt = new tdl.textures.DepthTexture(this.width, this.height);
      gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.TEXTURE_2D,
          dt.texture,
          0);
      this.depthTexture = dt;
    } else {
      var db = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, db);
      gl.renderbufferStorage(
          gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER,
          db);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      this.depthRenderbuffer = db;
    }
  }

  var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status != gl.FRAMEBUFFER_COMPLETE && !gl.isContextLost()) {
    throw("gl.checkFramebufferStatus() returned " +
          tdl.webgl.glEnumToString(status));
  }
  this.framebuffer = fb;
  this.texture = tex;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

tdl.framebuffers.Framebuffer.prototype.initializeTexture = function(tex) {
  gl.bindTexture(gl.TEXTURE_2D, tex.texture);
  tex.setParameter(gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  tex.setParameter(gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  tex.setParameter(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  tex.setParameter(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,
                0,                 // level
                gl.RGBA,           // internalFormat
                this.width,        // width
                this.height,       // height
                0,                 // border
                gl.RGBA,           // format
                gl.UNSIGNED_BYTE,  // type
                null);             // data
};

tdl.framebuffers.CubeFramebuffer = function(size, opt_depth) {
  this.size = size;
  this.depth = opt_depth;
  this.recoverFromLostContext();
};

tdl.framebuffers.CubeFramebuffer.prototype.bind = function(face) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[face]);
  gl.viewport(0, 0, this.size, this.size);
};

tdl.framebuffers.CubeFramebuffer.unbind = function() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(
      0, 0,
      gl.drawingBufferWidth || gl.canvas.width,
      gl.drawingBufferHeight || gl.canvas.height);
};

tdl.framebuffers.CubeFramebuffer.prototype.unbind = function() {
  tdl.framebuffers.CubeFramebuffer.unbind();
};

tdl.framebuffers.CubeFramebuffer.prototype.recoverFromLostContext = function() {
  var tex = new tdl.textures.CubeMap(this.size);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex.texture);
  tex.setParameter(gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  tex.setParameter(gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  tex.setParameter(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  tex.setParameter(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  for (var ff = 0; ff < 6; ++ff) {
    gl.texImage2D(tdl.textures.CubeMap.faceTargets[ff],
                  0,                 // level
                  gl.RGBA,           // internalFormat
                  this.size,         // width
                  this.size,         // height
                  0,                 // border
                  gl.RGBA,           // format
                  gl.UNSIGNED_BYTE,  // type
                  null);             // data
  }
  if (this.depth) {
    var db = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, db);
    gl.renderbufferStorage(
        gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
  }
  this.framebuffers = [];
  for (var ff = 0; ff < 6; ++ff) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        tdl.textures.CubeMap.faceTargets[ff],
        tex.texture,
        0);
    if (this.depth) {
      gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER,
          db);
    }
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      throw("gl.checkFramebufferStatus() returned " + WebGLDebugUtils.glEnumToString(status));
    }
    this.framebuffers.push(fb);
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  this.texture = tex;
};

tdl.framebuffers.Float32Framebuffer = function(width, height, opt_depth) {
  if (!gl.getExtension("OES_texture_float")) {
    throw("Requires OES_texture_float extension");
  }
  tdl.framebuffers.Framebuffer.call(this, width, height, opt_depth);
};

tdl.base.inherit(tdl.framebuffers.Float32Framebuffer, tdl.framebuffers.Framebuffer);

tdl.framebuffers.Float32Framebuffer.prototype.initializeTexture = function(tex) {
  gl.bindTexture(gl.TEXTURE_2D, tex.texture);
  tex.setParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  tex.setParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  tex.setParameter(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  tex.setParameter(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,
                0,                 // level
                gl.RGBA,           // internalFormat
                this.width,        // width
                this.height,       // height
                0,                 // border
                gl.RGBA,           // format
                gl.FLOAT,          // type
                null);             // data
};
