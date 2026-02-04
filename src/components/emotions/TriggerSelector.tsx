import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TriggerType, TRIGGER_OPTIONS } from '../../types/emotion';

interface TriggerSelectorProps {
  value: TriggerType;
  onValueChange: (value: TriggerType) => void;
  disabled?: boolean;
}

export const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const selectedOption = TRIGGER_OPTIONS.find((opt) => opt.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Déclencheur automatique</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.picker}
        >
          {TRIGGER_OPTIONS.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      {selectedOption && (
        <Text style={styles.description}>{selectedOption.description}</Text>
      )}

      <Text style={styles.helpText}>
        Plusieurs animations peuvent avoir le même déclencheur. Le système en
        choisira une au hasard pour éviter la répétitivité.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 16,
  },
});
