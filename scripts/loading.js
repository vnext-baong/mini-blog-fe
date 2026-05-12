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

window.escapeHTML = function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInSeconds = Math.floor((now - postDate) / 1000);

  const intervals = [
    { label: i18next.t("time.yearsAgo"), seconds: 31536000 },
    { label: i18next.t("time.monthsAgo"), seconds: 2592000 },
    { label: i18next.t("time.daysAgo"), seconds: 86400 },
    { label: i18next.t("time.hoursAgo"), seconds: 3600 },
    { label: i18next.t("time.minutesAgo"), seconds: 60 },
    { label: i18next.t("time.secondsAgo"), seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}`;
    }
  }

  return i18next.t("time.justNow");
};

async function getMe(token) {
  if (!token) return null;
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      refreshToken();
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

async function refreshToken() {
  const refreshToken = getCookie("rf");
  if (!refreshToken) {
    showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return null;
  }
  try {
    const response = await fetch(`${API_URL}/tokens/access-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    });
    const data = await response.json();
    if (response.ok) {
      document.cookie = `ac=${data.accessToken}; path=/; max-age=3600; secure; samesite=strict`;
      return data.accessToken;
    } else {
      showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
      return null;
    }
  } catch (error) {
    showToast("error", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return null;
  }
}

async function fetchWithAuth(url, options = {}) {
  let token = getCookie("ac");
  if (!token) {
    showToast("error", i18next.t("auth.pleaseLogin"));
    return null;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    token = await refreshToken();
    if (!token) return null;

    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
    response = await fetch(url, { ...options, headers: newHeaders });
  }

  return response;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}
