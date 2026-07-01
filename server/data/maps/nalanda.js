// Nalanda University ruins map for "Lost Artifact Hunt".
// Grid is 15 columns x 11 rows. 0 = walkable floor, 1 = wall (pillar/border).
// Represented as an ASCII layout for readability, parsed into numbers below.

const LAYOUT = [
  '###############',
  '#.............#',
  '#.#.#.#.#.#.#.#',
  '#.............#',
  '#.#.#.#.#.#.#.#',
  '#.............#',
  '#.#.#.#.#.#.#.#',
  '#.............#',
  '#.#.#.#.#.#.#.#',
  '#.............#',
  '###############',
];

const grid = LAYOUT.map(row => row.split('').map(ch => (ch === '#' ? 1 : 0)));

const ROWS = grid.length;
const COLS = grid[0].length;

const isWalkable = (row, col) => {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  return grid[row][col] === 0;
};

// Fixed artifact locations (6 total). Spread across the four quadrants + center.
const ARTIFACT_SPAWNS = [
  { row: 1, col: 2 },
  { row: 1, col: 12 },
  { row: 3, col: 7 },
  { row: 9, col: 2 },
  { row: 9, col: 12 },
  { row: 5, col: 7 },
];

// Coin locations (10 total), scattered along the open corridors.
const COIN_SPAWNS = [
  { row: 1, col: 5 }, { row: 1, col: 9 },
  { row: 3, col: 3 }, { row: 3, col: 11 },
  { row: 5, col: 2 }, { row: 5, col: 12 },
  { row: 7, col: 3 }, { row: 7, col: 11 },
  { row: 9, col: 5 }, { row: 9, col: 9 },
];

// Player spawn points (up to 6), placed along the center corridor, evenly spaced.
const PLAYER_SPAWNS = [
  { row: 5, col: 1 },
  { row: 5, col: 3 },
  { row: 5, col: 5 },
  { row: 5, col: 9 },
  { row: 5, col: 11 },
  { row: 5, col: 13 },
];

module.exports = {
  id: 'nalanda',
  name: 'Nalanda University Ruins',
  grid,
  ROWS,
  COLS,
  isWalkable,
  ARTIFACT_SPAWNS,
  COIN_SPAWNS,
  PLAYER_SPAWNS,
};
