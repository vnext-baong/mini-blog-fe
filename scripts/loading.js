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

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  const intervals = [
    { label: "năm", seconds: 31536000 },
    { label: "tháng", seconds: 2592000 },
    { label: "ngày", seconds: 86400 },
    { label: "giờ", seconds: 3600 },
    { label: "phút", seconds: 60 },
    { label: "giây", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label} trước`;
    }
  }

  return "vừa xong";
};
