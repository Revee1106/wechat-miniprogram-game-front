function createPanel(props = {}) {
  return {
    type: "panel",
    title: props.title || "",
    body: props.body || [],
  };
}

module.exports = {
  createPanel,
};
