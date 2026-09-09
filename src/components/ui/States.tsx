import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export function LoadingState({ label }: { label?: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <AppText muted style={{ marginTop: spacing.md }}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { spacing } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <AppText variant="subtitle" style={{ textAlign: 'center', marginBottom: spacing.xs }}>
        {title}
      </AppText>
      {description ? (
        <AppText muted style={{ textAlign: 'center', marginBottom: spacing.lg }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <AppButton title={actionLabel} onPress={onAction} fullWidth={false} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <AppText variant="subtitle" color={colors.danger} style={{ textAlign: 'center', marginBottom: spacing.xs }}>
        Something went wrong
      </AppText>
      <AppText muted style={{ textAlign: 'center', marginBottom: spacing.lg }}>
        {message}
      </AppText>
      {onRetry ? <AppButton title="Try again" onPress={onRetry} fullWidth={false} /> : null}
    </View>
  );
}
