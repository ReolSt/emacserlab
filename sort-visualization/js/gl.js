class GLShader {
  constructor(object) {
    this.glContext = object.glContext;
    this.type = object.type;
    this.source = object.source;

    this.shader = this.glContext.createShader(this.type);
    this.glContext.shaderSource(this.shader, this.source);
    this.glContext.compileShader(this.shader);

    let success = this.glContext.getShaderParameter(this.shader, this.glContext.COMPILE_STATUS);
    if (success) {
        return;
    }

    console.error("GLShader: Shader Compiling Error\n" + this.glContext.getShaderInfoLog(shader));
    this.glContext.deleteShader(shader);

    this.typeString = "";
    switch(this.type) {
      case this.glContext.VERTEX_SHADER:
        this.typeString = "fragment";
        break;
      case this.glContext.FRAGMENT_SHADER:
        this.typeString = "vertex";
        break;
    }
  }

  attachTo(program) {
    this.glContext.attachShader(program, this.shader);
  }
}

class GLProgram {
  constructor(object) {
    this.glContext = object.glContext;
    this.program = this.glContext.createProgram();

    this.shaders = object.shaders;
    this.shaders.forEach(shader => {
      shader.attachTo(this.program);
    });

    this.glContext.linkProgram(this.program);

    let success = this.glContext.getProgramParameter(this.program, this.glContext.LINK_STAUTS);
    if(success) {
      return;
    }

    console.log("GLProgram: Program Linking Error\n" + this.glContext.getProgramInfoLog(this.program));
    this.glContext.deleteProgram(this.program);
  }

  use() {
    this.glContext.useProgram(this.program);
  }
}

class GLArrayBuffer {
  constructor(object) {
    this.glContext = object.glContext;
    this.index = 0;
    this.size = 3;
    this.type = this.glContext.FLOAT;
    this.normalize = false;
    this.stride = 0;
    this.offset = 0;

    if (object.index) {
      this.index = object.index;
    }

    if (object.size) {
      this.size = object.size;
    }

    if (object.type) {
      this.type = object.type;
    }

    if (object.normalize) {
      this.normalize = object.normalize;
    }

    if (object.strided) {
      this.stride = object.stride;
    }

    if (object.offset) {
      this.offset = object.offset;
    }

    this.buffer = this.glContext.createBuffer();
    this.array = [];
  }

  realloc() {
    this.glContext.deleteBuffer(this.buffer);
    this.buffer = this.glContext.createBuffer();
  }

  delete() {
    this.glContext.deleteBuffer(this.buffer);
  }

  clear() {
    this.array = [];
  }

  push(data) {
    if(data instanceof Number) {
      this.array.push(data);
    }
    else if(data instanceof Array) {
      data.forEach(element => {
        this.array.push(element);
      });
    }
  }

  pop(size = 1) {
    this.array.pop(size);
  }

  getBuffer() {
    return this.array;
  }

  setBuffer(array) {
    this.array = array;
  }

  render() {
    this.glContext.enableVertexAttribArray(this.index);
    this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, this.buffer);

    visualizer.bufferData(
      visualizer.ARRAY_BUFFER,
      new Float32Array(this.array),
      visualizer.STATIC_DRAW
    );

    this.glContext.vertexAttribPointer(
      this.index,
      this.size,
      this.type,
      this.normalize,
      this.stride,
      this.offset
    );
  }
}

class GLRenderer {
  constructor(object) {
    this.glContext = object.glContext;
    this.viewportX = 0;
    this.viewportY = 0;
    this.viewportWidth = this.glContext.canvas.width;
    this.viewportHeight = this.glContext.canvas.height;

    this.drawType = this.glContext.TRIANGLES;
    this.offset = 0;

    this.buffers = [];

    if(object.drawType) {
      this.drawType = object.drawType;
    }

    if(object.offset) {
      this.offset = object.offset;
    }
  }

  setViewport(x, y, width, height) {
    this.viewportX = x;
    this.viewportY = y;
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  attachProgram(program) {

    this.program = program;
  }

  attachBuffer(buffer) {
    this.buffers.push(buffer);
  }

  detachBuffer(index) {
    this.buffers.splice(index, 1);
  }

  render() {
    this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);

    this.glContext.clearColor(0, 0, 0, 0);
    this.glContext.clear(this.glContext.COLOR_BUFFER_BIT);

    if (this.program) {
      this.program.use();
    }

    let count = 0

    this.buffers.forEach(buffer => {
      if(buffer.index == 0) {
        count = buffer.array.length / buffer.size;
      }
      buffer.render();
    });

    visualizer.drawArrays(
      this.drawType,
      this.offset,
      count
    );
  }
}