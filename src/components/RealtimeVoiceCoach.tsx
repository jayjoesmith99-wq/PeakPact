import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabaseClient';

type RealtimeVoiceCoachProps = {
  disabled?: boolean;
  onError?: (message: string) => void;
  onStatusChange?: (status: string) => void;
};

type RealtimeClientSecret = {
  value?: string;
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Realtime voice connection failed.';

export default function RealtimeVoiceCoach({ disabled = false, onError, onStatusChange }: RealtimeVoiceCoachProps) {
  const peerConnectionRef = useRef<any>(null);
  const localStreamRef = useRef<any>(null);
  const remoteStreamRef = useRef<any>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const disconnect = () => {
    const peerConnection = peerConnectionRef.current;
    peerConnectionRef.current = null;
    peerConnection?.getSenders?.().forEach((sender: any) => sender.track?.stop?.());
    peerConnection?.close?.();

    localStreamRef.current?.getTracks?.().forEach((track: any) => track.stop?.());
    localStreamRef.current = null;
  remoteStreamRef.current = null;
    setConnectionState('idle');
    onStatusChange?.('VOICE COACH OFFLINE');
  };

  useEffect(() => disconnect, []);

  const connect = async () => {
    if (Platform.OS === 'web') {
      onError?.('Realtime voice coaching requires the native PeakPact app.');
      return;
    }

    setConnectionState('connecting');
    onStatusChange?.('CONNECTING VOICE COACH...');

    try {
      const { data, error } = await supabase.functions.invoke<RealtimeClientSecret>('realtime-token', {
        body: { voice: 'sage' },
      });
      if (error || !data?.value) {
        throw new Error(error?.message || 'Realtime voice authorization failed.');
      }

      const { mediaDevices, RTCPeerConnection, RTCSessionDescription } = require('react-native-webrtc');
      const localStream = await mediaDevices.getUserMedia({ audio: true, video: false });
      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;
      localStreamRef.current = localStream;

      localStream.getTracks().forEach((track: any) => peerConnection.addTrack(track, localStream));
      peerConnection.ontrack = (event: any) => {
        remoteStreamRef.current = event.streams?.[0] ?? null;
      };
      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setConnectionState('connected');
          onStatusChange?.('VOICE COACH LISTENING');
        }
        if (['failed', 'disconnected', 'closed'].includes(peerConnection.connectionState)) {
          disconnect();
        }
      };

      const dataChannel = peerConnection.createDataChannel('oai-events');
      dataChannel.onopen = () => {
        dataChannel.send(JSON.stringify({
          type: 'session.update',
          session: {
            instructions: 'You are PeakPact, a concise execution coach. Be direct, supportive, and focus on the user\'s next physical action.',
          },
        }));
      };

      const offer = await peerConnection.createOffer({ offerToReceiveAudio: true });
      await peerConnection.setLocalDescription(offer);
      const response = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.value}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });
      if (!response.ok) {
        throw new Error('Realtime voice negotiation failed.');
      }

      const answerSdp = await response.text();
      await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }));
    } catch (error) {
      disconnect();
      onError?.(getErrorMessage(error));
    }
  };

  const isActive = connectionState !== 'idle';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isActive ? 'Disconnect voice coach' : 'Connect voice coach'}
      disabled={disabled || connectionState === 'connecting'}
      onPress={() => isActive ? disconnect() : void connect()}
      style={({ pressed }) => [styles.button, isActive && styles.buttonActive, (disabled || connectionState === 'connecting') && styles.buttonDisabled, pressed && styles.buttonPressed]}
    >
      {connectionState === 'connecting' ? <ActivityIndicator color="#9CE22A" /> : <Text style={styles.icon}>{isActive ? 'X' : 'AI'}</Text>}
      <View style={styles.copy}>
        <Text style={styles.label}>{isActive ? 'VOICE COACH LIVE' : 'LIVE VOICE COACH'}</Text>
        <Text style={styles.detail}>{isActive ? 'Tap to end session' : 'Talk with PeakPact in real time'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#161616', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  buttonActive: { borderColor: '#9CE22A', backgroundColor: 'rgba(156,226,42,0.12)' },
  buttonDisabled: { opacity: 0.55 },
  buttonPressed: { opacity: 0.85 },
  icon: { minWidth: 28, color: '#9CE22A', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  copy: { flex: 1 },
  label: { color: '#F5F5F5', fontSize: 13, fontWeight: '700' },
  detail: { color: '#A0A0A0', fontSize: 12, marginTop: 2 },
});