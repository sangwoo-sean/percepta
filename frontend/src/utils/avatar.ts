// ID 기반 색상 팔레트 (Google 스타일)
const AVATAR_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFC107', '#FF9800', '#FF5722', '#795548',
];

export function getAvatarColor(id: string): string {
  // ID의 첫 8자(UUID prefix)를 해시로 사용
  const hash = id.slice(0, 8).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function getInitial(name: string): string {
  return name?.[0]?.toUpperCase() || '?';
}
