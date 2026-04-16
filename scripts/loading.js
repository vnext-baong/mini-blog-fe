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
