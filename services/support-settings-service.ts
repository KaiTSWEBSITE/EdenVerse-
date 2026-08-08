import { translatorSupportConfig } from "@/config/support";
import { getSiteSetting, setSiteSetting } from "@/services/site-settings-service";

export type TranslatorSupportSettings = {
  translatorName: string;
  intro: string;
  donationNote: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  bankQrUrl: string;
  thankYouMessage: string;
  momoUrl: string;
  paypalUrl: string;
  koFiUrl: string;
};

const SUPPORT_SETTING_PREFIX = "translatorSupport";

const SUPPORT_SETTING_KEYS = {
  translatorName: `${SUPPORT_SETTING_PREFIX}.translatorName`,
  intro: `${SUPPORT_SETTING_PREFIX}.intro`,
  donationNote: `${SUPPORT_SETTING_PREFIX}.donationNote`,
  bankName: `${SUPPORT_SETTING_PREFIX}.bankName`,
  bankAccount: `${SUPPORT_SETTING_PREFIX}.bankAccount`,
  bankOwner: `${SUPPORT_SETTING_PREFIX}.bankOwner`,
  bankQrUrl: `${SUPPORT_SETTING_PREFIX}.bankQrUrl`,
  thankYouMessage: `${SUPPORT_SETTING_PREFIX}.thankYouMessage`,
  momoUrl: `${SUPPORT_SETTING_PREFIX}.momoUrl`,
  paypalUrl: `${SUPPORT_SETTING_PREFIX}.paypalUrl`,
  koFiUrl: `${SUPPORT_SETTING_PREFIX}.koFiUrl`
} as const;

export const DEFAULT_THANK_YOU_MESSAGE =
  "Cảm ơn bạn đã ủng hộ dịch giả. Mỗi lượt ủng hộ giúp tụi mình có thêm thời gian dịch kỹ hơn, kiểm tra lỗi cẩn thận hơn và giữ các bản Việt hóa sống lâu hơn.";

const SUPPORT_SETTING_FALLBACKS: TranslatorSupportSettings = {
  translatorName: translatorSupportConfig.translatorName,
  intro: translatorSupportConfig.intro,
  donationNote: translatorSupportConfig.donationNote,
  bankName: translatorSupportConfig.bankName,
  bankAccount: translatorSupportConfig.bankAccount,
  bankOwner: translatorSupportConfig.bankOwner,
  bankQrUrl: translatorSupportConfig.bankQrUrl,
  thankYouMessage: DEFAULT_THANK_YOU_MESSAGE,
  momoUrl: translatorSupportConfig.momoUrl,
  paypalUrl: translatorSupportConfig.paypalUrl,
  koFiUrl: translatorSupportConfig.koFiUrl
};

export async function getTranslatorSupportSettings(): Promise<TranslatorSupportSettings> {
  const entries = await Promise.all(
    Object.entries(SUPPORT_SETTING_KEYS).map(async ([field, key]) => [
      field,
      await getSiteSetting(key, SUPPORT_SETTING_FALLBACKS[field as keyof TranslatorSupportSettings])
    ])
  );

  return Object.fromEntries(entries) as TranslatorSupportSettings;
}

export async function setTranslatorSupportSettings(settings: TranslatorSupportSettings) {
  await Promise.all(
    Object.entries(SUPPORT_SETTING_KEYS).map(([field, key]) =>
      setSiteSetting(key, settings[field as keyof TranslatorSupportSettings])
    )
  );
}
