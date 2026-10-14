
import { Button, Text, View, StyleSheet } from 'react-native';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PaginationProps) {
  return (
    <View style={styles.container}>
      <Button
        title="Previous"
        onPress={onPrevious}
        disabled={currentPage <= 1}
      />

      <Text style={styles.label}>
        Page {currentPage} of {totalPages}
      </Text>

      <Button
        title="Next"
        onPress={onNext}
        disabled={currentPage >= totalPages}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
