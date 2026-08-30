import polyglotI18nProvider from "ra-i18n-polyglot";
import italianMessages from "ra-language-italian";

export const i18nProvider = polyglotI18nProvider(() => italianMessages, "it", {
  allowMissing: true,
});
