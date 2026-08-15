import React, { useState } from "react";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SupportedLanguage } from "../services/i18n";
import { getLocalizedText } from "../services/i18n";
import type { ComplianceConsent } from "../services/complianceService";
import { getPrivacyPolicyText, getTermsOfUseText } from "../services/complianceService";
import LegalDocumentModal from "./LegalDocumentModal";

const logo = require("../../assets/logo.peakpact.png");

type OnboardingFlowProps = {
  language: SupportedLanguage;
  consent: ComplianceConsent;
  onToggleConsent: () => void;
  onAcceptConsent: () => void;
  onComplete: () => void;
};

export default function OnboardingFlow({
  language,
  consent,
  onToggleConsent,
  onAcceptConsent,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [document, setDocument] = useState<"terms" | "privacy" | null>(null);
  const text = (key: string) => getLocalizedText(key, language);
  const consentChecked = consent.privacyAccepted && consent.termsAccepted && consent.ageConfirmed;

  const handleNext = () => {
    if (step === 0) {
      if (!consentChecked) return;
      onAcceptConsent();
    }
    if (step === 3) {
      onComplete();
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>PEAKPACT</Text>
          <Text style={styles.stepLabel}>{text("onboardingStepLabel")} {step + 1} / 4</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / 4) * 100}%` }]} />
        </View>

        {step === 0 ? (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>{text("consentScreenTitle")}</Text>
            <Text style={styles.title}>{text("onboardingWelcomeTitle")}</Text>
            <Text style={styles.body}>{text("onboardingWelcomeBody")}</Text>
            <View style={styles.policyBox}>
              <Text style={styles.policyIntro}>{text("consentScreenBody")}</Text>
              <View style={styles.linkRow}>
                <Pressable onPress={() => setDocument("terms")} accessibilityRole="button">
                  <Text style={styles.link}>{text("consentTermsSectionTitle")}</Text>
                </Pressable>
                <Text style={styles.linkDivider}>·</Text>
                <Pressable onPress={() => setDocument("privacy")} accessibilityRole="button">
                  <Text style={styles.link}>{text("consentPrivacySectionTitle")}</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: consentChecked }}
              onPress={onToggleConsent}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                {consentChecked ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>{text("consentPrivacyLabel")} {text("consentTermsLabel")}</Text>
            </Pressable>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>{text("onboardingStep2Title")}</Text>
            <Text style={styles.title}>{text("onboardingStep2Body")}</Text>
            <View style={styles.dualMockup}>
              <View style={styles.mockButton}>
                <Text style={styles.mockNumber}>01</Text>
                <Text style={styles.mockButtonText}>{text("pactModeCommitLabel")}</Text>
                <Text style={styles.mockHint}>{text("pactModeCommitHint")}</Text>
              </View>
              <View style={styles.mockButton}>
                <Text style={styles.mockNumber}>02</Text>
                <Text style={styles.mockButtonText}>{text("pactModeLogLabel")}</Text>
                <Text style={styles.mockHint}>{text("pactModeLogHint")}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>{text("tutorialVoiceTitle",)}</Text>
            <Text style={styles.title}>{text("onboardingStep3Title")}</Text>
            <Text style={styles.body}>{text("tutorialVoiceBody")}</Text>
            <View style={styles.voiceDemo}>
              <View style={styles.micCircle}><Text style={styles.mic}>MIC</Text></View>
              <Text style={styles.voiceDemoText}>{text("tutorialVoiceHint")}</Text>
            </View>
            <Text style={styles.safetyNote}>{text("onboardingVoiceSafety")}</Text>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.screen}>
            <Text style={styles.eyebrow}>{text("logProofSectionTitle")}</Text>
            <Text style={styles.title}>{text("onboardingStep4Title")}</Text>
            <Text style={styles.body}>{text("onboardingStep4Body")}</Text>
            <View style={styles.achievementCard}>
              <Text style={styles.cardLabel}>{text("onboardingAchievementLabel")}</Text>
              <Text style={styles.cardTitle}>{text("pactModeLogLabel")}</Text>
              <Text style={styles.cardValue}>+20 PP · 7 DAY STREAK</Text>
              <Text style={styles.cardFooter}>PEAKPACT // PRIVACY-SAFE</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {step > 0 ? (
            <Pressable style={styles.backButton} onPress={() => setStep((current) => current - 1)}>
              <Text style={styles.backText}>{text("onboardingBackLabel")}</Text>
            </Pressable>
          ) : <View style={styles.backSpacer} />}
          <Pressable
            disabled={step === 0 && !consentChecked}
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, step === 0 && !consentChecked && styles.disabled, pressed && styles.pressed]}
          >
            <Text style={styles.nextText}>{step === 3 ? text("onboardingStartButton") : text("onboardingNextLabel")}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <LegalDocumentModal
        visible={document !== null}
        title={document === "terms" ? text("consentTermsSectionTitle") : text("consentPrivacySectionTitle")}
        sections={document === "terms" ? getTermsOfUseText(language) : getPrivacyPolicyText(language)}
        closeLabel={text("commonClose")}
        onClose={() => setDocument(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#080808" },
  content: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 18 },
  logo: { width: 76, height: 76, marginBottom: 8 },
  brand: { color: "#F5F5F5", fontSize: 16, fontWeight: "800", letterSpacing: 3 },
  stepLabel: { color: "#A0A0A0", fontSize: 11, letterSpacing: 1.4, marginTop: 16 },
  progressTrack: { height: 4, backgroundColor: "#161616", borderRadius: 2, marginBottom: 28 },
  progressFill: { height: 4, backgroundColor: "#9CE22A", borderRadius: 2 },
  screen: { width: "100%", maxWidth: 520, alignSelf: "center", minHeight: 390 },
  eyebrow: { color: "#9CE22A", fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 12 },
  title: { color: "#F5F5F5", fontSize: 28, lineHeight: 35, fontWeight: "800", marginBottom: 16 },
  body: { color: "#A0A0A0", fontSize: 16, lineHeight: 25, marginBottom: 20 },
  policyBox: { backgroundColor: "#111111", borderColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 18 },
  policyIntro: { color: "#A0A0A0", fontSize: 14, lineHeight: 21, marginBottom: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  link: { color: "#9CE22A", fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
  linkDivider: { color: "#A0A0A0", marginHorizontal: 8 },
  checkboxRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: "#555555", alignItems: "center", justifyContent: "center", marginRight: 12 },
  checkboxChecked: { backgroundColor: "#9CE22A", borderColor: "#9CE22A" },
  checkmark: { color: "#080808", fontWeight: "900" },
  checkboxLabel: { color: "#F5F5F5", flex: 1, fontSize: 14, lineHeight: 21 },
  dualMockup: { flexDirection: "row", gap: 12 },
  mockButton: { flex: 1, backgroundColor: "#111111", borderColor: "#9CE22A", borderWidth: 1, borderRadius: 12, padding: 14 },
  mockNumber: { color: "#9CE22A", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  mockButtonText: { color: "#F5F5F5", fontSize: 15, lineHeight: 19, fontWeight: "700", marginTop: 6 },
  mockHint: { color: "#A0A0A0", fontSize: 13, lineHeight: 19, marginTop: 5 },
  voiceDemo: { backgroundColor: "#111111", borderRadius: 16, borderWidth: 1, borderColor: "rgba(156,226,42,0.35)", padding: 22, alignItems: "center", marginVertical: 8 },
  micCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: "#9CE22A", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  mic: { color: "#080808", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  voiceDemoText: { color: "#F5F5F5", fontSize: 14, lineHeight: 21, textAlign: "center" },
  safetyNote: { color: "#9CE22A", fontSize: 14, lineHeight: 21, fontWeight: "600", marginTop: 16 },
  achievementCard: { backgroundColor: "#F5F5F5", borderRadius: 12, padding: 20, marginTop: 12 },
  cardLabel: { color: "#5D6B4D", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  cardTitle: { color: "#080808", fontSize: 23, fontWeight: "800", marginTop: 12 },
  cardValue: { color: "#35402D", fontSize: 14, fontWeight: "700", marginTop: 24 },
  cardFooter: { color: "#7A8571", fontSize: 10, letterSpacing: 1, marginTop: 24 },
  actions: { flexDirection: "row", alignItems: "center", maxWidth: 520, width: "100%", alignSelf: "center", marginTop: 18 },
  backSpacer: { flex: 1 },
  backButton: { minHeight: 48, justifyContent: "center", paddingHorizontal: 12 },
  backText: { color: "#A0A0A0", fontSize: 14, fontWeight: "700" },
  nextButton: { minHeight: 50, flex: 1, maxWidth: 260, backgroundColor: "#9CE22A", borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  nextText: { color: "#080808", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8 },
});
