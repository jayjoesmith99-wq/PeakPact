import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

type RevenueCatPaywallScreenProps = {
  onDismiss: () => void;
};

export default function RevenueCatPaywallScreen({ onDismiss }: RevenueCatPaywallScreenProps) {
  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        options={{ displayCloseButton: true }}
        onPurchaseCompleted={onDismiss}
        onDismiss={onDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
});