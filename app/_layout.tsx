import { Stack } from 'expo-router';
import { colors } from '../src/theme';
import { AuthProvider } from '../src/auth';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fredoka: require('../assets/fonts/Fredoka.ttf') });
  if (!fontsLoaded) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.pinkDark}/></View>;
  return <AuthProvider><Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTitleStyle: { fontFamily: 'Fredoka', fontSize: 22 }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="index" options={{ title: 'Inseparable' }}/>
    <Stack.Screen name="avatar" options={{ title: 'Create your avatar' }}/>
  </Stack></AuthProvider>;
}
