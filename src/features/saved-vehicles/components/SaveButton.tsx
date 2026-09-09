import { Pressable, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '../../../auth/auth-context';
import { useIsVehicleSaved, useSaveVehicle, useRemoveSavedVehicle } from '../queries';
import { AppText } from '../../../components/ui';
import { useTheme } from '../../../theme';

interface SaveButtonProps {
  vehicleId: string;
  size?: 'sm' | 'md';
}

// Always visible/tappable regardless of auth state — tapping while logged
// out sends the user to log in instead of hiding the button entirely.
export function SaveButton({ vehicleId, size = 'md' }: SaveButtonProps) {
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuth();
  const isSaved = useIsVehicleSaved(vehicleId);
  const save = useSaveVehicle();
  const remove = useRemoveSavedVehicle();
  const pending = save.isPending || remove.isPending;

  const handlePress = () => {
    if (!isAuthenticated) {
      router.push({ pathname: '/login', params: { returnTo: pathname } });
      return;
    }
    if (isSaved) remove.mutate(vehicleId);
    else save.mutate(vehicleId);
  };

  const dim = size === 'sm' ? 32 : 40;

  return (
    <Pressable
      onPress={handlePress}
      disabled={pending}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={isSaved ? 'Remove from saved vehicles' : 'Save vehicle'}
    >
      <View
        style={{
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: 'rgba(255,255,255,0.9)',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pending ? 0.6 : 1,
        }}
      >
        <AppText style={{ fontSize: size === 'sm' ? 16 : 18 }} color={isSaved ? colors.primary : colors.text}>
          {isSaved ? '♥' : '♡'}
        </AppText>
      </View>
    </Pressable>
  );
}
