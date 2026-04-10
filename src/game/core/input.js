function registerInputHandlers(handlers = {}) {
  if (typeof wx === "undefined") {
    return {
      dispose() {},
    };
  }

  const touchStartHandler = typeof handlers.onTouchStart === "function" ? handlers.onTouchStart : () => {};
  const touchMoveHandler = typeof handlers.onTouchMove === "function" ? handlers.onTouchMove : () => {};
  const touchEndHandler = typeof handlers.onTouchEnd === "function" ? handlers.onTouchEnd : () => {};

  if (typeof wx.onTouchStart === "function") {
    wx.onTouchStart(touchStartHandler);
  }
  if (typeof wx.onTouchMove === "function") {
    wx.onTouchMove(touchMoveHandler);
  }
  if (typeof wx.onTouchEnd === "function") {
    wx.onTouchEnd(touchEndHandler);
  }

  return {
    dispose() {},
  };
}

module.exports = {
  registerInputHandlers,
};
