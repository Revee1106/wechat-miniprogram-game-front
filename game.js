const { createRuntime } = require("./src/game/core/runtime");
const { registerInputHandlers } = require("./src/game/core/input");
const { createViewportLayout } = require("./src/game/core/layout");
const { createMainStageScreen } = require("./src/game/screens/main-stage-screen");
const adapter = require("./src/game/adapters/run-store-adapter");

function createCanvasSurface() {
  const systemInfo =
    typeof wx !== "undefined" && typeof wx.getSystemInfoSync === "function"
      ? wx.getSystemInfoSync()
      : { windowWidth: 375, windowHeight: 667, pixelRatio: 1, safeArea: null };
  const canvas = typeof wx !== "undefined" && typeof wx.createCanvas === "function" ? wx.createCanvas() : null;
  const context = canvas && typeof canvas.getContext === "function" ? canvas.getContext("2d") : null;
  const pixelRatio = Number(systemInfo.pixelRatio) || 1;
  const logicalWidth = Number(systemInfo.windowWidth) || 375;
  const logicalHeight = Number(systemInfo.windowHeight) || 667;
  const width = Math.round(logicalWidth * pixelRatio);
  const height = Math.round(logicalHeight * pixelRatio);

  if (canvas) {
    canvas.width = width;
    canvas.height = height;
  }

  if (context && typeof context.scale === "function") {
    context.scale(pixelRatio, pixelRatio);
  }

  return {
    canvas,
    context,
    width: logicalWidth,
    height: logicalHeight,
    pixelRatio,
    systemInfo,
  };
}

function boot() {
  const surface = createCanvasSurface();
  const layout = createViewportLayout(surface.width, surface.height, {
    safeArea: surface.systemInfo && surface.systemInfo.safeArea ? surface.systemInfo.safeArea : null,
  });
  let runtimeInstance = null;
  const screen = createMainStageScreen({
    adapter,
    requestRender: () => {
      if (runtimeInstance) {
        runtimeInstance.requestRender();
      }
    },
  });

  runtimeInstance = createRuntime({
    canvas: surface.canvas,
    context: surface.context,
    width: layout.width,
    height: layout.height,
    systemInfo: surface.systemInfo,
    renderer: (frame) => screen.render(frame),
  });

  registerInputHandlers({
    onTouchStart() {},
    onTouchMove() {},
    onTouchEnd(event) {
      screen.handleTouchEnd(event);
    },
  });

  runtimeInstance.requestRender();
  return runtimeInstance;
}

boot();
