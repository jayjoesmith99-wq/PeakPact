import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ResizeMode, Video } from "expo-av";

const welcomeVideo = require("../../assets/9e977029180a9977b941d4d9561753b0.mp4");
const logo = require("../../assets/logo.peakpact.png");
const backdrop = require("../../assets/elite-backdrop.jpeg");

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 6500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <Image source={backdrop} style={styles.backdrop} resizeMode="cover" />
      <View style={styles.backdropOverlay} />
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.eyebrow}>WELCOME TRANSMISSION</Text>
        <Text style={styles.title}>PEAKPACT</Text>
        <Text style={styles.subtitle}>
          System synchronized. Your daily command center is online.
        </Text>

        <View style={styles.videoShell}>
          <Video
            source={welcomeVideo}
            style={styles.video}
            shouldPlay
            isLooping={false}
            resizeMode={ResizeMode.COVER}
            useNativeControls={false}
            isMuted={false}
          />
          <View style={styles.videoGlow} />
        </View>

        <View style={styles.copyPanel}>
          <Text style={styles.copyText}>
            Pick your target, seal your pact, and turn today's grind into real progress.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>ENTER THE PACT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#02060c",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.88,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 14, 0.76)",
  },
  content: {
    width: "100%",
    maxWidth: 560,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    zIndex: 1,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 14,
  },
  eyebrow: {
    color: "#25F9D5",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1.6,
  },
  subtitle: {
    color: "#C2D5E3",
    fontFamily: "monospace",
    fontSize: 13,
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 20,
  },
  videoShell: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.42)",
    backgroundColor: "rgba(3, 8, 18, 0.88)",
    marginBottom: 14,
    shadowColor: "#25F9D5",
    shadowOpacity: 0.24,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  video: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37, 249, 213, 0.09)",
    pointerEvents: "none",
  },
  copyPanel: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(79, 163, 255, 0.28)",
    backgroundColor: "rgba(4, 10, 20, 0.78)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  copyText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  button: {
    borderWidth: 1,
    borderColor: "rgba(37, 249, 213, 0.54)",
    backgroundColor: "rgba(37, 249, 213, 0.16)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#4FA3FF",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonText: {
    color: "#F7FCFF",
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});