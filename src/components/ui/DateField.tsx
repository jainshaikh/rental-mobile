import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

interface DateFieldProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  error?: string;
  mode?: 'date' | 'datetime';
}

export function DateField({ label, value, onChange, minimumDate, error, mode = 'date' }: DateFieldProps) {
  const { colors, radii, spacing } = useTheme();
  const [showIosPicker, setShowIosPicker] = useState(false);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      const base = value ?? minimumDate ?? new Date();
      DateTimePickerAndroid.open({
        value: base,
        mode: 'date',
        minimumDate,
        onChange: (event, selectedDate) => {
          if (event.type !== 'set' || !selectedDate) return;
          if (mode === 'date') {
            onChange(selectedDate);
            return;
          }
          // Android shows date and time as two sequential native dialogs.
          DateTimePickerAndroid.open({
            value: base,
            mode: 'time',
            onChange: (timeEvent, selectedTime) => {
              if (timeEvent.type !== 'set' || !selectedTime) return;
              const combined = new Date(selectedDate);
              combined.setHours(selectedTime.getHours(), selectedTime.getMinutes());
              onChange(combined);
            },
          });
        },
      });
    } else {
      setShowIosPicker(true);
    }
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <AppText variant="label" style={{ marginBottom: spacing.xs }}>
        {label}
      </AppText>
      <Pressable
        onPress={openPicker}
        style={{
          minHeight: 48,
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          backgroundColor: colors.surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <AppText color={value ? colors.text : colors.textMuted}>
          {value
            ? mode === 'datetime'
              ? value.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : value.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
            : mode === 'datetime'
              ? 'Select date & time'
              : 'Select date'}
        </AppText>
      </Pressable>

      {Platform.OS === 'ios' && showIosPicker ? (
        <DateTimePicker
          value={value ?? minimumDate ?? new Date()}
          mode={mode}
          display="spinner"
          minimumDate={minimumDate}
          onChange={(event, selectedDate) => {
            setShowIosPicker(false);
            if (event.type === 'set' && selectedDate) onChange(selectedDate);
          }}
        />
      ) : null}

      {error ? (
        <AppText variant="caption" color={colors.danger} style={{ marginTop: spacing.xs }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
