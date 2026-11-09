import { StyleSheet, View } from 'react-native';
import { AvatarConfig, avatarOptions } from './avatar';

export function AvatarPreview({ avatar, size = 210 }: { avatar: AvatarConfig; size?: number }) {
  const scale = size / 210;
  const skin = avatarOptions.skin[avatar.skin];
  const hair = avatarOptions.hairColor[avatar.hairColor];
  const shirt = avatarOptions.shirtColor[avatar.shirtColor];
  const faceWidth = [116, 104, 122][avatar.face];
  const faceRadius = [55, 49, 38][avatar.face];
  const eyeSize = avatar.eyes === 1 ? 15 : 11;
  const eyeHeight = avatar.eyes === 2 ? 5 : 12;
  return <View style={{ width: size, height: size, overflow: 'hidden', borderRadius: size / 2, backgroundColor: '#EDE2FA' }}>
    <View style={{ width: 210, height: 210, transform: [{ scale }], transformOrigin: 'top left' }}>
      <View style={[s.body, { backgroundColor: shirt }]} />
      {avatar.shirt === 1 && <View style={s.collar} />}
      {avatar.shirt === 2 && <View style={s.sweater} />}
      <View style={[s.neck, { backgroundColor: skin }]} />
      <View style={[s.ear, { left: 41, backgroundColor: skin }]} />
      <View style={[s.ear, { right: 41, backgroundColor: skin }]} />
      <View style={[s.face, { width: faceWidth, left: (210 - faceWidth) / 2, borderRadius: faceRadius, backgroundColor: skin }]} />
      {avatar.hair !== 0 && <>
        {avatar.hair === 4 && <View style={[s.longHair, { backgroundColor: hair }]} />}
        {avatar.hair === 5 && <View style={[s.bun, { backgroundColor: hair }]} />}
        <View style={[s.hair, { backgroundColor: hair, height: avatar.hair === 3 ? 45 : 32, borderTopLeftRadius: avatar.hair === 3 ? 47 : 65, borderTopRightRadius: 65, transform: avatar.hair === 2 ? [{ rotate: '-12deg' }] : [] }]} />
        {avatar.hair === 3 && [0, 1, 2, 3].map(i => <View key={i} style={{ position: 'absolute', top: 22 + (i % 2) * 5, left: 50 + i * 27, width: 37, height: 34, borderRadius: 20, backgroundColor: hair }} />)}
      </>}
      {[0, 1].map(i => <View key={i} style={{ position: 'absolute', top: 92, left: i ? 125 : 73, alignItems: 'center' }}>
        <View style={{ width: 22, height: avatar.brows === 1 ? 3 : 5, borderRadius: 6, backgroundColor: hair, transform: [{ rotate: avatar.brows === 2 ? (i ? '-17deg' : '17deg') : '0deg' }] }} />
        <View style={{ width: eyeSize, height: eyeHeight, borderRadius: 10, backgroundColor: '#302435', marginTop: 8 }} />
      </View>)}
      <View style={{ position: 'absolute', left: 102, top: 119, width: avatar.nose === 2 ? 8 : 6, height: avatar.nose === 2 ? 21 : 12, borderRadius: 8, backgroundColor: '#B87960', opacity: 0.7 }} />
      {avatar.facialHair === 2 && <View style={{ position: 'absolute', top: 135, left: 78, width: 54, height: 35, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, backgroundColor: hair }} />}
      {avatar.facialHair === 1 && <View style={{ position: 'absolute', top: 138, left: 91, width: 28, height: 8, borderRadius: 8, backgroundColor: hair }} />}
      <View style={{ position: 'absolute', top: avatar.mouth === 2 ? 148 : 143, left: avatar.mouth === 1 ? 90 : 94, width: avatar.mouth === 1 ? 30 : 22, height: avatar.mouth === 2 ? 3 : 12, borderBottomWidth: avatar.mouth === 2 ? 0 : 3, borderRadius: 14, backgroundColor: avatar.mouth === 2 ? '#9B5A5F' : 'transparent', borderColor: '#9B4A5C' }} />
      {avatar.glasses > 0 && <View style={{ position: 'absolute', top: 101, left: 67, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 36, height: 27, borderWidth: 3, borderColor: '#393044', borderRadius: avatar.glasses === 1 ? 18 : 5 }} />
        <View style={{ width: 8, height: 3, backgroundColor: '#393044' }} />
        <View style={{ width: 36, height: 27, borderWidth: 3, borderColor: '#393044', borderRadius: avatar.glasses === 1 ? 18 : 5 }} />
      </View>}
    </View>
  </View>;
}

const s = StyleSheet.create({
  body: { position: 'absolute', width: 170, height: 93, left: 20, top: 162, borderTopLeftRadius: 74, borderTopRightRadius: 74 },
  neck: { position: 'absolute', top: 143, left: 91, width: 28, height: 34, borderRadius: 8 },
  ear: { position: 'absolute', top: 106, width: 20, height: 27, borderRadius: 15 },
  face: { position: 'absolute', top: 40, height: 124 },
  hair: { position: 'absolute', top: 34, left: 48, width: 114 },
  longHair: { position: 'absolute', top: 53, left: 40, width: 130, height: 111, borderRadius: 48 },
  bun: { position: 'absolute', top: 13, left: 91, width: 37, height: 42, borderRadius: 24 },
  collar: { position: 'absolute', top: 170, left: 83, width: 45, height: 20, backgroundColor: '#FFFFFFCC', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  sweater: { position: 'absolute', top: 174, left: 82, width: 46, height: 9, borderRadius: 8, backgroundColor: '#FFFFFF66' },
});
