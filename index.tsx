import { registerRootComponent } from 'expo';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './App';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { initializeTelemetry } from './src/services/telemetryService';

void initializeTelemetry();

function RootComponent() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

registerRootComponent(RootComponent);
