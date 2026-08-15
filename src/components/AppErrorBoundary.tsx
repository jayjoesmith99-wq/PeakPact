import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { recordCrash } from '../services/telemetryService';
import i18n from 'i18next';
import { getLocalizedText, resolveLanguage } from '../i18n';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    void recordCrash('startup_crash', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const language = resolveLanguage(i18n.language);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.title}>{getLocalizedText('appTitle', language)}</Text>
          <Text style={styles.body}>
            {getLocalizedText('profileLanguageNote', language)}
          </Text>
          <Pressable style={styles.button} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>{getLocalizedText('onboardingButton', language)}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0E11',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(21,26,32,0.9)',
    padding: 18,
  },
  title: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '800',
  },
  body: {
    color: '#A7B1BC',
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#00FF88',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: '#0B0E11',
    fontWeight: '700',
  },
});
