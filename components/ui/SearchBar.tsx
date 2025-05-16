import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchIconContainer}>
        <Search size={18} color={Colors.textSecondary} />
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => onChangeText('')}
        >
          <X size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
});