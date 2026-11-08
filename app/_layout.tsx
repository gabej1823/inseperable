import { Stack } from 'expo-router';
import { colors } from '../src/theme';

export default function RootLayout() {
  return <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }} />;
}
