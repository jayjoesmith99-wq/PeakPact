import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import HabitTrackerScreen from '../screens/Habits/HabitTrackerScreen';
import AudioPlayerScreen from '../screens/AudioPlayer/AudioPlayerScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import { getLocalizedText } from '../i18n';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#111111',
            borderBottomWidth: 0,
          } as any,
          headerTintColor: '#F5F5F5',
          headerTitleStyle: {
            color: '#F5F5F5',
            fontWeight: '700',
            fontSize: 15,
          },
          contentStyle: {
            backgroundColor: '#080808',
          },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: getLocalizedText('navHome') }} />
        <Stack.Screen name="Habits" component={HabitTrackerScreen} options={{ title: getLocalizedText('navHabits') }} />
        <Stack.Screen name="Audio" component={AudioPlayerScreen} options={{ title: getLocalizedText('navAudio') }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: getLocalizedText('navProfile') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
