import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home/HomeScreen';
import HabitTrackerScreen from '../screens/Habits/HabitTrackerScreen';
import AudioPlayerScreen from '../screens/AudioPlayer/AudioPlayerScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'rgba(2, 6, 14, 0.96)',
          } as any,
          headerTintColor: '#f3fff1',
          headerTitleStyle: {
            color: '#f3fff1',
            fontWeight: '700',
            fontSize: 15,
          },
          contentStyle: {
            backgroundColor: '#02060c',
          },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'COMMAND CENTER' }} />
        <Stack.Screen name="Habits" component={HabitTrackerScreen} options={{ title: 'HABITS' }} />
        <Stack.Screen name="Audio" component={AudioPlayerScreen} options={{ title: 'AUDIO' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'PROFILE' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
