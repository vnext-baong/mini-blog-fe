const defaultLang = localStorage.getItem("lang") || "vi";

async function initI18n() {
  try {
    const [enRes, viRes] = await Promise.all([
      fetch("./i18n/en.json").then((res) => res.json()),
      fetch("./i18n/vi.json").then((res) => res.json()),
    ]);

    await i18next.init({
      lng: defaultLang,
      fallbackLng: "vi",
      resources: {
        en: { translation: enRes },
        vi: { translation: viRes },
      },
    });

    updateContent();
  } catch (error) {
    console.error("Lỗi khi tải đa ngôn ngữ:", error);
  }
}

function updateContent() {
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    element.textContent = i18next.t(key);
  });

  const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
  placeholders.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    element.setAttribute("placeholder", i18next.t(key));
  });

  const timeElements = document.querySelectorAll("[data-timestamp]");
  timeElements.forEach((element) => {
    const timestamp = element.getAttribute("data-timestamp");
    if (timestamp && typeof formatTimeAgo === "function") {
      element.textContent = formatTimeAgo(timestamp);
    }
  });
}

function changeLanguage(lang) {
  localStorage.setItem("lang", lang);
  i18next.changeLanguage(lang).then(() => {
    updateContent();
    if (typeof updateLangFlag === "function") {
      updateLangFlag();
    }
  });
}

initI18n();
