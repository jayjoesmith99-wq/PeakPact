import React from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type LegalDocumentModalProps = {
  visible: boolean;
  title: string;
  sections: string[];
  closeLabel: string;
  onClose: () => void;
};

export default function LegalDocumentModal({
  visible,
  title,
  sections,
  closeLabel,
  onClose,
}: LegalDocumentModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PEAKPACT // DOCUMENT</Text>
          <Text style={styles.title}>{title}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>{closeLabel}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {sections.map((section, index) => (
            <Text key={`${index}-${section}`} style={styles.body}>{section}</Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#080808" },
  header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  eyebrow: { color: "#9CE22A", fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginBottom: 8 },
  title: { color: "#F5F5F5", fontSize: 24, fontWeight: "800", paddingRight: 90 },
  closeButton: { position: "absolute", top: 16, right: 18, minHeight: 42, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", borderRadius: 8 },
  closeText: { color: "#F5F5F5", fontSize: 13, fontWeight: "700" },
  content: { padding: 22, paddingBottom: 48 },
  body: { color: "#C4C4C4", fontSize: 15, lineHeight: 24, marginBottom: 18 },
});
