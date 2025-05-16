import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  style?: ViewStyle;
}

export default function FilterChip({ 
  label, 
  isSelected, 
  onPress, 
  icon,
  style 
}: FilterChipProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.chip,
        isSelected ? styles.selectedChip : styles.unselectedChip,
        style
      ]} 
      onPress={onPress}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text 
        style={[
          styles.label,
          isSelected ? styles.selectedLabel : styles.unselectedLabel
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unselectedChip: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  iconContainer: {
    marginRight: 4,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  selectedLabel: {
    color: Colors.white,
  },
  unselectedLabel: {
    color: Colors.textPrimary,
  },
});