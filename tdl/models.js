/**
 * @fileoverview This file contains objects to manage models.
 */

tdl.provide('tdl.models');

tdl.require('tdl.buffers');

/**
 * A module for models.
 * @namespace
 */
tdl.models = tdl.models || {};

/**
 * Manages a program, buffers and textures for easier drawing.
 * @constructor
 * @param {!tdl.programs.Program} program The program to render
 *     this model with
 * @param {!Object.<string, AttribBuffer>} arrays The
 *     AttribBuffers to bind to draw this model.
 * @param {!Object.<string, Texture>} textures The textures to
 *     bind to draw this model.
 * @param {number} opt_mode Mode to call drawElements with. Default =
 *        gl.TRIANGLES
 */
tdl.models.Model = function(program, arrays, textures, opt_mode) {
  this.buffers = { };
  this.setBuffers(arrays);

  var textureUnits = { }
  var unit = 0;
  for (var texture in program.textures) {
    textureUnits[texture] = unit++;
  }

  this.mode = (opt_mode === undefined) ? gl.TRIANGLES : opt_mode;
  this.textures = textures;
  this.textureUnits = textureUnits;
  this.setProgram(program);
}

tdl.models.Model.prototype.setProgram = function(program) {
  this.program = program;
}

tdl.models.Model.prototype.setBuffer = function(name, array, opt_newBuffer) {
  var target = (name == 'indices') ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
  var b = this.buffers[name];
  if (!b || opt_newBuffer) {
    b = new tdl.buffers.Buffer(array, target);
  } else {
    b.set(array);
  }
  this.buffers[name] = b;
};

tdl.models.Model.prototype.setBuffers = function(arrays, opt_newBuffers) {
  var that = this;
  for (var name in arrays) {
    this.setBuffer(name, arrays[name], opt_newBuffers);
  }
  if (this.buffers.indices) {
    this.baseBuffer = this.buffers.indices;
    this.drawFunc = function(totalComponents, startOffset) {
      gl.drawElements(that.mode, totalComponents, gl.UNSIGNED_SHORT, startOffset);
    }
  } else {
    for (var key in this.buffers) {
      this.baseBuffer = this.buffers[key];
      break;
    }
    this.drawFunc = function(totalComponents, startOffset) {
      gl.drawArrays(that.mode, startOffset, totalComponents);
    }
  }
};

tdl.models.Model.prototype.applyUniforms_ = function(opt_uniforms) {
  if (opt_uniforms) {
    var program = this.program;
    for (var uniform in opt_uniforms) {
      program.setUniform(uniform, opt_uniforms[uniform]);
    }
  }
};

/**
 * Sets up the shared parts of drawing this model. Uses the
 * program, binds the buffers, sets the textures.
 *
 * @param {!Object.<string, *>} opt_uniforms An object of names to
 *     values to set on this models uniforms.
 * @param {!Object.<string, *>} opt_textures An object of names to
 *     textures to set on this models uniforms.
 */
tdl.models.Model.prototype.drawPrep = function() {
  var program = this.program;
  var buffers = this.buffers;
  var textures = this.textures;

  program.use();
  for (var buffer in buffers) {
    var b = buffers[buffer];
    if (buffer == 'indices') {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.buffer());
    } else {
      var attrib = program.attrib[buffer];
      if (attrib) {
        attrib(b);
      }
    }
  }

  this.applyUniforms_(textures);
  for (var ii = 0; ii < arguments.length; ++ii) {
    this.applyUniforms_(arguments[ii]);
  }
};

/**
 * Draws this model.
 *
 * After calling tdl.models.Model.drawPrep you can call this
 * function multiple times to draw this model.
 *
 * @param {!Object.<string, *>} opt_uniforms An object of names to
 *     values to set on this models uniforms.
 * @param {!Object.<string, *>} opt_textures An object of names to
 *     textures to set on this models uniforms.
 */
tdl.models.Model.prototype.draw = function() {
  var buffers = this.buffers;
  // if no indices buffer then assume drawFunc is drawArrays and thus
  // totalComponents is the number of vertices (not indices).
  var totalComponents = buffers.indices? buffers.indices.totalComponents(): buffers.position.numElements();
  var startOffset = 0;
  for (var ii = 0; ii < arguments.length; ++ii) {
    var arg = arguments[ii];
    if (typeof arg == 'number') {
      switch (ii) {
      case 0:
        totalComponents = arg;
        break;
      case 1:
        startOffset = arg;
        break;
      default:
        throw 'unvalid argument';
      }
    } else {
      this.applyUniforms_(arg);
    }
  }

  this.drawFunc(totalComponents, startOffset);
};
