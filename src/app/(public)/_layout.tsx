import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

export default function PublicLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="vehicle/[id]" options={{ title: '' }} />
      <Stack.Screen name="provider/[id]" options={{ title: '' }} />
      <Stack.Screen name="trip/[id]" options={{ title: '' }} />
    </Stack>
  );
}
