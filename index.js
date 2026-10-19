/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';
import { name as appName } from './app.json';

// Expo Go starts the component registered as "main".
registerRootComponent(App);

// Keep the existing native Android project compatible with MainActivity,
// which still starts the component named in app.json ("MyApp").
AppRegistry.registerComponent(appName, () => App);
