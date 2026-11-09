export type AvatarConfig = {
  preset: number;
  skin: number; face: number; eyes: number; brows: number; nose: number;
  mouth: number; hair: number; hairColor: number; facialHair: number;
  glasses: number; shirt: number; shirtColor: number;
};

export const defaultAvatar: AvatarConfig = {
  preset: 0,
  skin: 2, face: 0, eyes: 0, brows: 0, nose: 0, mouth: 0,
  hair: 1, hairColor: 1, facialHair: 0, glasses: 0, shirt: 0, shirtColor: 0,
};

export const avatarOptions = {
  preset: ['1','2','3','4','5','6','7','8','9','10','11','12'],
  skin: ['#F7D5B5', '#EFC09A', '#D99C73', '#B97953', '#945735', '#623C2B'],
  face: ['Round', 'Oval', 'Square'],
  eyes: ['Classic', 'Wide', 'Sleepy', 'Happy'],
  brows: ['Soft', 'Straight', 'Arched'],
  nose: ['Button', 'Small', 'Long'],
  mouth: ['Smile', 'Grin', 'Calm'],
  hair: ['Bald', 'Short', 'Side part', 'Curly', 'Long', 'Bun'],
  hairColor: ['#2F2020', '#65412C', '#B67842', '#E8C477', '#C65842', '#A1A0A7'],
  facialHair: ['None', 'Mustache', 'Beard'],
  glasses: ['None', 'Round', 'Square'],
  shirt: ['T-shirt', 'Collar', 'Sweater'],
  shirtColor: ['#C8507B', '#7455B7', '#468C82', '#E99B57', '#5B769E', '#444454'],
} satisfies Record<keyof AvatarConfig, readonly string[]>;

export function normalizeAvatar(input: unknown): AvatarConfig {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result = { ...defaultAvatar };
  (Object.keys(result) as (keyof AvatarConfig)[]).forEach(key => {
    const value = raw[key];
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < avatarOptions[key].length) result[key] = value;
  });
  return result;
}
