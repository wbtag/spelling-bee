import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import cs from "./locales/cs.json";

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  fallbackLocale: "en",
  messages: {
    en,
    cs,
  },
});
