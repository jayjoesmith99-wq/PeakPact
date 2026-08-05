import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

// NOTE: Supabase and RevenueCat logic to be injected here later once the build is stable.

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PeakPact</Text>
        <Text style={styles.subtitle}>System Initialized. Awaiting your first move.</Text>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#E0E0E0', marginBottom: 12, letterSpacing: 2 },
  subtitle: { fontSize: 16, color: '#888888', textAlign: 'center' },
});
