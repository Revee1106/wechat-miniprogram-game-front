function createModal(props = {}) {
  return {
    type: "modal",
    title: props.title || "",
    body: props.body || [],
    confirmText: props.confirmText || "确认",
  };
}

module.exports = {
  createModal,
};
