import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../../../theme';
import { AppText } from '../../../components/ui';

interface Option<T extends string> {
  label: string;
  value: T;
}

export function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T | undefined;
  onChange: (next: T | undefined) => void;
}) {
  const { colors, radii, spacing } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(selected ? undefined : option.value)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radii.full,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : 'transparent',
              }}
            >
              <AppText variant="caption" color={selected ? colors.primaryText : colors.text}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
