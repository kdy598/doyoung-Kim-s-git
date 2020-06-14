/**
 * @fileoverview This file contains a class which assists with the
 * loading of GLSL shaders.
 */

tdl.provide('tdl.shader');

/**
 * A module for shaders.
 * @namespace
 */
tdl.shader = tdl.shader || {};

/**

 * Loads a shader from vertex and fragment programs specified in
 * "script" nodes in the HTML page. This provides a convenient
 * mechanism for writing GLSL snippets without the burden of
 * additional syntax like per-line quotation marks.
 * @param {!WebGLRenderingContext} gl The WebGLRenderingContext
 *     into which the shader will be loaded.
 * @param {!string} vertexScriptName The name of the HTML Script node
 *     containing the vertex program.
 * @param {!string} fragmentScriptName The name of the HTML Script node
 *     containing the fragment program.
 */
tdl.shader.loadFromScriptNodes = function(gl,
                                            vertexScriptName,
                                            fragmentScriptName) {
  var vertexScript = document.getElementById(vertexScriptName);
  var fragmentScript = document.getElementById(fragmentScriptName);
  if (!vertexScript || !fragmentScript)
    return null;
  return new tdl.shader.Shader(gl,
                                 vertexScript.text,
                                 fragmentScript.text);
}

/**
 * Helper which convers GLSL names to JavaScript names.
 * @private
 */
tdl.shader.glslNameToJs_ = function(name) {
  return name.replace(/_(.)/g, function(_, p1) { return p1.toUpperCase(); });
}

/**
 * Creates a new Shader object, loading and linking the given vertex
 * and fragment shaders into a program.
 * @param {!WebGLRenderingContext} gl The WebGLRenderingContext
 *     into which the shader will be loaded.
 * @param {!string} vertex The vertex shader.
 * @param {!string} fragment The fragment shader.
 */
tdl.shader.Shader = function(gl, vertex, fragment) {
  this.program = gl.createProgram();
  this.gl = gl;

  var vs = this.loadShader(this.gl.VERTEX_SHADER, vertex);
  if (!vs) {
    tdl.log("couldn't load shader")
  }
  this.gl.attachShader(this.program, vs);
  this.gl.deleteShader(vs);

  var fs = this.loadShader(this.gl.FRAGMENT_SHADER, fragment);
  if (!fs) {
    tdl.log("couldn't load shader")
  }
  this.gl.attachShader(this.program, fs);
  this.gl.deleteShader(fs);

  this.gl.linkProgram(this.program);
  this.gl.useProgram(this.program);

  // Check the link status
  var linked = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
  if (!linked && !this.gl.isContextLost()) {
    var infoLog = this.gl.getProgramInfoLog(this.program);
    tdl.error("Error linking program:\n" + infoLog);
    this.gl.deleteProgram(this.program);
    this.program = null;
    return;
  }

  // find uniforms and attributes
  var re = /(uniform|attribute|in)\s+\S+\s+(\w+)\s*(\[\d+\])?\s*;/g;
  var match = null;
  while ((match = re.exec(vertex)) != null) {
    var glslName = match[2];
    var jsName = tdl.shader.glslNameToJs_(glslName);
    if (match[1] == "uniform") {
      this[jsName + "Loc"] = this.getUniform(glslName);
    } else if (match[1] == "attribute" || match[1] == "in") {
      this[jsName + "Loc"] = this.getAttribute(glslName);
    }
  }
  re = /(uniform)\s+\S+\s+(\w+)\s*(\[\d+\])?\s*;/g;
  match = null;
  while ((match = re.exec(fragment)) != null) {
    var glslName = match[2];
    var jsName = tdl.shader.glslNameToJs_(glslName);
    if (match[1] == "uniform") {
      this[jsName + "Loc"] = this.getUniform(glslName);
    }
  }
}

/**
 * Binds the shader's program.
 */
tdl.shader.Shader.prototype.bind = function() {
  this.gl.useProgram(this.program);
}

/**
 * Helper for loading a shader.
 * @private
 */
tdl.shader.Shader.prototype.loadShader = function(type, shaderSrc) {
  var shader = this.gl.createShader(type);
  if (shader == null) {
    return null;
  }

  // Load the shader source
  this.gl.shaderSource(shader, shaderSrc);
  // Compile the shader
  this.gl.compileShader(shader);
  // Check the compile status
  if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    var infoLog = this.gl.getShaderInfoLog(shader);
    tdl.error("Error compiling shader:\n" + infoLog);
    this.gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Helper for looking up an attribute's location.
 * @private
 */
tdl.shader.Shader.prototype.getAttribute = function(name) {
  return this.gl.getAttribLocation(this.program, name);
};

/**
 * Helper for looking up an attribute's location.
 * @private
 */
tdl.shader.Shader.prototype.getUniform = function(name) {
  return this.gl.getUniformLocation(this.program, name);
}
