import { Stack } from 'expo-router';
import { colors } from '../src/theme';
import { AuthProvider } from '../src/auth';

export default function RootLayout() {
  return <AuthProvider><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }} /></AuthProvider>;
}
