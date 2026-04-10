function createViewportLayout(width, height, options = {}) {
  const viewportWidth = Math.max(0, Number(width) || 0);
  const viewportHeight = Math.max(0, Number(height) || 0);
  const safeArea = options && options.safeArea ? options.safeArea : null;

  const safeTop = safeArea ? Math.max(0, Number(safeArea.top) || 0) : 0;
  const safeBottom = safeArea ? Math.max(0, viewportHeight - (Number(safeArea.bottom) || viewportHeight)) : 0;
  const safeLeft = safeArea ? Math.max(0, Number(safeArea.left) || 0) : 0;
  const safeRight = safeArea ? Math.max(0, viewportWidth - (Number(safeArea.right) || viewportWidth)) : 0;

  const outerPadding = 24;
  const contentLeft = safeLeft + outerPadding;
  const contentRight = viewportWidth - safeRight - outerPadding;
  const contentWidth = Math.max(0, contentRight - contentLeft);

  const headerTop = safeTop + 18;
  const headerHeight = 92;
  const footerGap = 14;
  const tagHeight = 42;
  const tagGap = 10;
  const footerTagRows = Math.max(1, Number(options.footerTagRows) || 1);
  const footerPaddingTop = 18;
  const footerPaddingBottom = 24 + safeBottom;
  const tagAreaHeight = footerTagRows * tagHeight + Math.max(0, footerTagRows - 1) * tagGap;
  const footerHeight = footerPaddingTop + tagAreaHeight + footerPaddingBottom;
  const footerTop = viewportHeight - footerHeight;
  const primaryButtonHeight = 68;
  const primaryButtonY = footerTop - footerGap - primaryButtonHeight;
  const scrollTop = headerTop + headerHeight + 18;
  const scrollBottom = primaryButtonY - 18;
  const scrollHeight = Math.max(180, scrollBottom - scrollTop);

  return {
    width: viewportWidth,
    height: viewportHeight,
    safeTop,
    safeBottom,
    safeLeft,
    safeRight,
    contentLeft,
    contentRight,
    contentWidth,
    headerTop,
    headerHeight,
    scrollTop,
    scrollHeight,
    primaryButtonY,
    primaryButtonHeight,
    footerTop,
    footerHeight,
    footerGap,
    footerTagRows,
    tagHeight,
    tagGap,
  };
}

module.exports = {
  createViewportLayout,
};
