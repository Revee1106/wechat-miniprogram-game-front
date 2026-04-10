function createRuntime(options = {}) {
  const state = {
    canvas: options.canvas || null,
    context: options.context || null,
    width: Number(options.width) || 0,
    height: Number(options.height) || 0,
    systemInfo: options.systemInfo || null,
    renderer: typeof options.renderer === "function" ? options.renderer : () => {},
  };

  function render() {
    state.renderer({
      canvas: state.canvas,
      context: state.context,
      width: state.width,
      height: state.height,
      systemInfo: state.systemInfo,
    });
  }

  function requestRender() {
    render();
  }

  function setRenderer(nextRenderer) {
    state.renderer = typeof nextRenderer === "function" ? nextRenderer : state.renderer;
    requestRender();
  }

  return {
    get canvas() {
      return state.canvas;
    },
    get context() {
      return state.context;
    },
    get width() {
      return state.width;
    },
    get height() {
      return state.height;
    },
    requestRender,
    setRenderer,
  };
}

module.exports = {
  createRuntime,
};
