<<<<<<< HEAD
export type LaunchMetadata = {
  supportEmail: string;
  privacyUrl: string;
  termsUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
};

const defaultMetadata: LaunchMetadata = {
  supportEmail: 'support@peakpact.app',
  privacyUrl: 'https://peakpact.app/privacy',
  termsUrl: 'https://peakpact.app/terms',
  appStoreUrl: 'https://peakpact.app/download/ios',
  playStoreUrl: 'https://peakpact.app/download/android',
};

export const getLaunchMetadata = (): LaunchMetadata => ({
  supportEmail: process.env.EXPO_PUBLIC_PEAKPACT_SUPPORT_EMAIL?.trim() || defaultMetadata.supportEmail,
  privacyUrl: process.env.EXPO_PUBLIC_PEAKPACT_PRIVACY_URL?.trim() || defaultMetadata.privacyUrl,
  termsUrl: process.env.EXPO_PUBLIC_PEAKPACT_TERMS_URL?.trim() || defaultMetadata.termsUrl,
  appStoreUrl: process.env.EXPO_PUBLIC_PEAKPACT_APPSTORE_URL?.trim() || defaultMetadata.appStoreUrl,
  playStoreUrl: process.env.EXPO_PUBLIC_PEAKPACT_PLAYSTORE_URL?.trim() || defaultMetadata.playStoreUrl,
});
=======
export function getLaunchMetadata() {
  return {
    supportEmail: "support@peakpact.app",
    privacyUrl: "https://peakpact.app/privacy",
    termsUrl: "https://peakpact.app/terms",
    playStoreUrl: "https://play.google.com/store/apps/details?id=peakpact",
    appStoreUrl: "https://apps.apple.com/app/peakpact",
  };
}
>>>>>>> 2f1cd419750ef14ad65a62a00c79510454ca7b37
