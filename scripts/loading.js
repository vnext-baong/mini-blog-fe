const btnLoading = {
  start(btnElement) {
    btnElement.classList.add("is-loading");
    btnElement.disabled = true;
  },
  stop(btnElement) {
    btnElement.classList.remove("is-loading");
    btnElement.disabled = false;
  },
};

const validateInput = (inputElement) => {
  inputElement.addEventListener("beforeinput", (e) => {
    if (e.data && !/^[0-9a-zA-Z]*$/.test(e.data)) {
      e.preventDefault();
    }
  });

  inputElement.addEventListener("input", (e) => {
    const value = e.target.value;
    if (!/^[0-9a-zA-Z]*$/.test(value)) {
      e.target.value = value.replace(/[^0-9a-zA-Z]/g, "");
    }
  });

  inputElement.addEventListener("paste", (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text",
    );
    if (!/^[0-9a-zA-Z]*$/.test(pastedText)) {
      e.preventDefault();
    }
  });
};
