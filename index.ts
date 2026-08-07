import type { ComponentType } from 'react';
import { registerRootComponent } from 'expo';

import App from './App';

const RootComponent: ComponentType = App;

// registerRootComponent calls AppRegistry.registerComponent('main', () => AppNavigator);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootComponent);