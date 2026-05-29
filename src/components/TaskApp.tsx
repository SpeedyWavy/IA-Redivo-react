import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

export default function TaskApp() {
  return <View style={styles.container} />;
}

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
});