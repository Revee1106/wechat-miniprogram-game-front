function createDrawer(props = {}) {
  return {
    type: "drawer",
    key: props.key || "",
    title: props.title || "",
    open: props.open === true,
    body: props.body || [],
  };
}

module.exports = {
  createDrawer,
};
