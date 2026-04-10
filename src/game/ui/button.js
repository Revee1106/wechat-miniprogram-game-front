function createButton(props = {}) {
  return {
    type: "button",
    label: props.label || "",
    disabled: props.disabled === true,
    onPress: props.onPress || null,
  };
}

module.exports = {
  createButton,
};
