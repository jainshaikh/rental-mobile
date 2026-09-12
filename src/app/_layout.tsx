import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';

import { queryClient } from '../api/query-client';
import { AuthProvider, useAuth } from '../auth/auth-context';
import { configureNotificationHandler } from '../features/notifications/pushToken';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

// Only the rider-facing events map to one specific already-known screen
// (the rider's own request, by inquiryId); a tap on the poster-facing
// "new request" notification just opens the app normally rather than
// guessing a wrong destination — the poster's per-inquiry view lives inside
// a trip we don't have the id for from the push payload alone.
const RIDER_FACING_TYPES = new Set(['tripInquiry.accepted', 'tripInquiry.rejected', 'tripInquiry.cancelled']);

function useNotificationTapNavigation() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string; inquiryId?: string } | undefined;
      if (data?.type && RIDER_FACING_TYPES.has(data.type) && data.inquiryId) {
        router.push(`/account/trip-request/${data.inquiryId}`);
      }
    });
    return () => subscription.remove();
  }, []);
}

function RootNavigator() {
  const { isBootstrapping } = useAuth();
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold });
  const isReady = !isBootstrapping && fontsLoaded;
  useNotificationTapNavigation();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // Keep the native splash screen up (instead of swapping to a blank/unstyled screen)
  // until fonts are loaded AND session bootstrap resolves — avoids ever flashing a
  // protected screen pre-auth-check or system-font text before Outfit loads.
  if (!isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(public)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="account" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
