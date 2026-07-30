import React, { useState, useEffect } from 'react';
import { Modal, Platform, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from './text';

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Bottom sheet for picking a time (or date) on iOS, with an explicit confirm action.
 *
 * Two non-obvious constraints drive this implementation:
 *
 * 1. RNDateTimePicker is a *controlled* component — the native wheel snaps back to
 *    whatever `value` holds, so `value` must follow `onChange` or the wheel can't be
 *    scrolled. That draft state lives here rather than in the screen that opens the
 *    sheet, so scrolling only re-renders this sheet instead of the whole form.
 *
 * 2. `minimumDate`/`maximumDate` must always be real dates. Left undefined they reach
 *    the native side as 0, so `maximumDate` becomes the Unix epoch and UIKit clamps the
 *    picker to 1970 — the wheel then appears frozen (at 8:00 PM in GMT-0400) and every
 *    onChange reports epoch 0. Defaulting to the bounds of the picked day keeps the
 *    picker unrestricted for time selection while staying well-defined.
 *
 * Android is not handled here; it has its own native dialog.
 */
export const TimePickerSheet = ({
  visible,
  value,
  mode = 'time',
  title = 'Selecciona una hora',
  minimumDate,
  maximumDate,
  onCancel,
  onConfirm,
}) => {
  const [draft, setDraft] = useState(value || new Date());

  // Start each session from the value the caller is editing
  useEffect(() => {
    if (visible && value) {
      setDraft(value);
    }
  }, [visible, value]);

  if (Platform.OS === 'android') return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-white rounded-t-2xl pb-8">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={onCancel}>
              <Text variant="body" className="text-gray-500">Cancelar</Text>
            </TouchableOpacity>
            <Text variant="body" className="font-semibold">{title}</Text>
            <TouchableOpacity onPress={() => onConfirm(draft)}>
              <Text variant="body" className="text-primary-500 font-semibold">Listo</Text>
            </TouchableOpacity>
          </View>
          {/* themeVariant/textColor: the sheet is always white, so don't inherit the
              phone's dark mode or the wheel renders white on white */}
          <DateTimePicker
            value={draft}
            mode={mode}
            display="spinner"
            themeVariant="light"
            textColor="#111827"
            minimumDate={minimumDate || startOfDay(draft)}
            maximumDate={maximumDate || endOfDay(draft)}
            onChange={(event, date) => date && setDraft(date)}
          />
        </View>
      </View>
    </Modal>
  );
};
