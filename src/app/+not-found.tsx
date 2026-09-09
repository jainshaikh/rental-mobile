import { Link, Stack } from 'expo-router';
import { AppScreen, AppText } from '../components/ui';
import { useTheme } from '../theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <AppScreen contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
        <AppText variant="subtitle" style={{ marginBottom: 12 }}>
          This screen doesn&apos;t exist.
        </AppText>
        <Link href="/">
          <AppText color={colors.primary}>Go to home</AppText>
        </Link>
      </AppScreen>
    </>
  );
}
