import { Image, ImageStyle, StyleProp } from 'react-native';
import { AvatarConfig } from './avatar';

// Complete character portraits are intentionally kept together: mixing separately
// drawn faces, hair and shadows was making the clay characters look incoherent.
const portraits = [
  require('../assets/avatars/clay-00.jpg'),
  require('../assets/avatars/clay-01.jpg'),
  require('../assets/avatars/clay-02.jpg'),
  require('../assets/avatars/clay-03.jpg'),
  require('../assets/avatars/clay-04.jpg'),
  require('../assets/avatars/clay-05.jpg'),
  require('../assets/avatars/clay-06.jpg'),
  require('../assets/avatars/clay-07.jpg'),
  require('../assets/avatars/clay-08.jpg'),
  require('../assets/avatars/clay-09.jpg'),
  require('../assets/avatars/clay-10.jpg'),
  require('../assets/avatars/clay-11.jpg'),
];

export const clayPortraitCount = portraits.length;

export function AvatarPreview({ avatar, size = 210, style }: { avatar: AvatarConfig; size?: number; style?: StyleProp<ImageStyle> }) {
  const preset = Number.isInteger(avatar.preset) && avatar.preset >= 0 && avatar.preset < portraits.length ? avatar.preset : 0;
  return <Image
    source={portraits[preset]}
    accessibilityLabel={`Clay avatar style ${preset + 1}`}
    resizeMode="cover"
    style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E8D3F4' }, style]}
  />;
}
