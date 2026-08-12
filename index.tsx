import { registerRootComponent } from 'expo';
import React from 'react';

import App from './App';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import { initializeTelemetry } from './src/services/telemetryService';

void initializeTelemetry();

function RootComponent() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}

registerRootComponent(RootComponent);
