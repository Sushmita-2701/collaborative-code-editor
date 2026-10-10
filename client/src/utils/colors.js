const USER_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#34d399',
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fb7185',
  '#2dd4bf', '#a78bfa', '#60a5fa', '#e879f9', '#a3e635'
];

export const getUserColor = (idOrName) => {
  if (!idOrName) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
};
