import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { AvatarConfig, avatarOptions } from './avatar';

/** Soft clay-toy avatar built from editable vector layers. */
export function AvatarPreview({ avatar, size = 210 }: { avatar: AvatarConfig; size?: number }) {
  const skin = avatarOptions.skin[avatar.skin];
  const hair = avatarOptions.hairColor[avatar.hairColor];
  const shirt = avatarOptions.shirtColor[avatar.shirtColor];
  const rx = [65, 57, 67][avatar.face];
  const ry = [69, 75, 66][avatar.face];
  return <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityLabel="Your customized clay-style avatar">
    <Defs>
      <RadialGradient id="bg" cx="35%" cy="22%" rx="90%" ry="90%"><Stop offset="0" stopColor="#FFF7FF"/><Stop offset="1" stopColor="#D6BDED"/></RadialGradient>
      <RadialGradient id="face" cx="30%" cy="20%" rx="88%" ry="92%"><Stop offset="0" stopColor="#FFFFFF" stopOpacity=".45"/><Stop offset=".4" stopColor={skin}/><Stop offset="1" stopColor="#693A35" stopOpacity=".35"/></RadialGradient>
      <LinearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFFFFF" stopOpacity=".27"/><Stop offset=".4" stopColor={hair}/><Stop offset="1" stopColor="#1D1625" stopOpacity=".45"/></LinearGradient>
      <LinearGradient id="shirt" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFFFFF" stopOpacity=".3"/><Stop offset=".4" stopColor={shirt}/><Stop offset="1" stopColor="#332A46" stopOpacity=".4"/></LinearGradient>
    </Defs>
    <Circle cx="120" cy="120" r="120" fill="url(#bg)"/>
    <Ellipse cx="120" cy="244" rx="109" ry="78" fill="url(#shirt)"/>
    {avatar.shirt === 1 && <Path d="M93 185 L120 207 L147 185" stroke="#FFFAF4" strokeWidth="13" fill="none"/>}
    {avatar.shirt === 2 && <Path d="M84 202 Q120 222 156 202" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="8" fill="none"/>}
    <Rect x="103" y="162" width="34" height="35" rx="13" fill={skin}/>
    {avatar.hair === 4 && <Path d="M50 110 Q37 22 120 22 Q199 22 190 110 L200 206 Q164 216 151 166 L83 166 Q70 213 42 199Z" fill="url(#hair)"/>}
    {avatar.hair === 5 && <Circle cx="121" cy="30" r="29" fill="url(#hair)"/>}
    <Ellipse cx="55" cy="124" rx="17" ry="23" fill={skin}/><Ellipse cx="185" cy="124" rx="17" ry="23" fill={skin}/>
    <Ellipse cx="120" cy="118" rx={rx} ry={ry} fill="url(#face)"/>
    <Ellipse cx="73" cy="145" rx="16" ry="10" fill="#F16E85" opacity=".23"/><Ellipse cx="167" cy="145" rx="16" ry="10" fill="#F16E85" opacity=".23"/>
    {avatar.hair !== 0 && <G>
      {avatar.hair === 3 ? [58,79,102,125,149,171].map((x,i)=><Circle key={x} cx={x} cy={i%2 ? 54 : 64} r={i%2 ? 27 : 29} fill="url(#hair)"/>) :
      <Path d={avatar.hair === 2 ? 'M52 105 Q38 38 105 35 Q156 23 186 72 Q164 65 146 74 Q112 83 72 80Z' : 'M53 105 Q46 33 105 36 Q169 18 186 94 Q166 72 151 62 Q116 88 85 70 Q76 96 53 105Z'} fill="url(#hair)"/>}
      <Path d="M73 60 Q104 41 137 49" stroke="#FFFFFF" strokeOpacity=".2" strokeWidth="9" strokeLinecap="round" fill="none"/>
    </G>}
    {[88,152].map((x,i)=><G key={x}>
      <Path d={avatar.brows === 2 ? `M${x-14} 97 Q${x} ${i ? 84 : 89} ${x+14} 96` : `M${x-13} 95 Q${x} ${avatar.brows === 1 ? 95 : 89} ${x+13} 95`} stroke={hair} strokeWidth="5" strokeLinecap="round" fill="none"/>
      {avatar.eyes === 3 ? <Path d={`M${x-14} 120 Q${x} 101 ${x+14} 120`} stroke="#35232C" strokeWidth="5" fill="none" strokeLinecap="round"/> : <>
        <Ellipse cx={x} cy="120" rx={avatar.eyes === 1 ? 15 : 12} ry={avatar.eyes === 2 ? 8 : avatar.eyes === 1 ? 18 : 15} fill="#FFFBF8"/>
        <Ellipse cx={x} cy="121" rx="8" ry={avatar.eyes === 2 ? 7 : 11} fill="#38242E"/>
        <Circle cx={x-3} cy="116" r="3.5" fill="#FFFFFF"/><Circle cx={x+4} cy="127" r="1.4" fill="#FFFFFF"/>
        {avatar.eyes === 2 && <Path d={`M${x-14} 115 Q${x} 110 ${x+14} 115`} stroke="#5B3542" strokeWidth="5" fill="none" strokeLinecap="round"/>}
      </>}
    </G>)}
    <Ellipse cx="120" cy={avatar.nose === 2 ? 144 : 140} rx={avatar.nose === 1 ? 5 : 7} ry={avatar.nose === 2 ? 11 : 6} fill="#A65E53" opacity=".45"/>
    <Ellipse cx="118" cy="138" rx="3" ry="2" fill="#FFFFFF" opacity=".4"/>
    {avatar.facialHair === 2 && <Path d="M89 151 Q85 182 120 185 Q155 182 151 151 Q140 171 120 170 Q100 171 89 151Z" fill="url(#hair)"/>}
    {avatar.facialHair === 1 && <Path d="M104 150 Q113 145 120 150 Q128 145 136 150 Q128 161 120 156 Q111 161 104 150Z" fill="url(#hair)"/>}
    {avatar.mouth === 2 ? <Path d="M109 162 Q120 165 131 162" stroke="#87414E" strokeWidth="3" strokeLinecap="round" fill="none"/> : <>
      <Path d={avatar.mouth === 1 ? 'M101 158 Q120 184 139 158 Q120 164 101 158Z' : 'M109 159 Q120 175 131 159'} fill={avatar.mouth === 1 ? '#793747' : 'none'} stroke="#98475A" strokeWidth="3" strokeLinecap="round"/>
      {avatar.mouth === 1 && <Path d="M106 162 Q120 168 134 162" stroke="#FFF8F3" strokeWidth="5" fill="none"/>}
    </>}
    {avatar.glasses > 0 && <G fill="none" stroke="#433448" strokeWidth="4">
      <Rect x="65" y="105" width="45" height="33" rx={avatar.glasses === 1 ? 16 : 5}/><Rect x="130" y="105" width="45" height="33" rx={avatar.glasses === 1 ? 16 : 5}/><Path d="M110 114 Q120 108 130 114 M65 111 L50 108 M175 111 L190 108"/>
    </G>}
  </Svg>;
}
