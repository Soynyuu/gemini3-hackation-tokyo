"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/types.ts
var VOXEL_TYPES = [
  "standard",
  "emissive",
  "transparent"
];
var DEFAULT_GRID_SIZE = [5, 5, 5];

// src/grid.ts
function isWithinBounds(pos, gridSize = DEFAULT_GRID_SIZE) {
  return pos[0] >= 0 && pos[0] < gridSize[0] && pos[1] >= 0 && pos[1] < gridSize[1] && pos[2] >= 0 && pos[2] < gridSize[2];
}
function positionKey(pos) {
  return pos.join(",");
}
function positionsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function createGridConfig(size = DEFAULT_GRID_SIZE) {
  return { size };
}

// src/voxels.ts
function placeVoxel(voxels, voxel, gridSize = DEFAULT_GRID_SIZE) {
  if (!isWithinBounds(voxel.pos, gridSize)) {
    return [...voxels];
  }
  const exists = voxels.some((v) => positionsEqual(v.pos, voxel.pos));
  if (exists) {
    return voxels.map((v) => positionsEqual(v.pos, voxel.pos) ? voxel : v);
  }
  return [...voxels, voxel];
}
function removeVoxel(voxels, pos) {
  return voxels.filter((v) => !positionsEqual(v.pos, pos));
}
function findVoxel(voxels, pos) {
  return voxels.find((v) => positionsEqual(v.pos, pos));
}
function hasVoxelAt(voxels, pos) {
  return voxels.some((v) => positionsEqual(v.pos, pos));
}

// src/scoring.ts
function calculateStructureScore(playerVoxels, targetVoxels) {
  const playerSet = new Set(playerVoxels.map((v) => positionKey(v.pos)));
  const targetSet = new Set(targetVoxels.map((v) => positionKey(v.pos)));
  let intersection = 0;
  for (const key of playerSet) {
    if (targetSet.has(key)) intersection++;
  }
  const union = (/* @__PURE__ */ new Set([...playerSet, ...targetSet])).size;
  return union === 0 ? 0 : Math.round(intersection / union * 100);
}
function calculateScores(playerVoxels, plan) {
  const structureScore = calculateStructureScore(playerVoxels, plan.voxels);
  const vibeScore = Math.min(
    100,
    Math.round(structureScore * 0.5 + Math.random() * 50)
  );
  const rationale = structureScore > 50 ? "\u300C\u5B64\u7ACB\u3057\u305F\u5854\u300D\u306E\u30D0\u30A4\u30D6\u30B9\u3092\u3046\u307E\u304F\u6349\u3048\u3066\u3044\u307E\u3059\u3002\u30A8\u30DF\u30C3\u30B7\u30D6\uFF08\u767A\u5149\uFF09\u306E\u30A2\u30AF\u30BB\u30F3\u30C8\u304C\u610F\u56F3\u3092\u5F37\u8ABF\u3057\u3066\u3044\u307E\u3059\u304C\u3001\u914D\u7F6E\u306E\u30CE\u30A4\u30BA\u304C\u5C11\u3057\u65B9\u5411\u6027\u3092\u307C\u3084\u3051\u3055\u305B\u3066\u3044\u307E\u3059\u3002" : "\u6838\u5FC3\u3068\u306A\u308B\u69CB\u9020\u7684\u306A\u610F\u56F3\u304C\u898B\u5931\u308F\u308C\u3066\u304A\u308A\u3001\u30D0\u30A4\u30D6\u30B9\u304C\u96C6\u4E2D\u3057\u305F\u3082\u306E\u3067\u306F\u306A\u304F\u3001\u66D6\u6627\u306B\u306A\u3063\u3066\u3057\u307E\u3063\u3066\u3044\u307E\u3059\u3002";
  return {
    structureScore,
    vibeScore,
    totalScore: Math.round(structureScore * 0.6 + vibeScore * 0.4),
    rationale
  };
}

// src/director.ts
var randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
var MOCK_PROMPTS = [
  "\u5B64\u7ACB\u3057\u305F\u5854\u306E\u4E0A\u306B\u6F02\u3046\u3001\u304B\u3059\u304B\u306A\u671D\u306E\u5149",
  "\u5730\u4E0B\u6DF1\u304F\u306B\u3042\u308B\u3001\u6DF7\u6C8C\u3068\u3057\u305F\u30CD\u30AA\u30F3\u306E\u5E02\u5834",
  "\u4E00\u3064\u306E\u7126\u70B9\u3092\u6301\u3064\u3001\u7A4F\u3084\u304B\u3067\u6D6E\u904A\u3059\u308B\u7985\u306E\u5EAD",
  "\u5E73\u539F\u304B\u3089\u7A81\u304D\u51FA\u3059\u3001\u653B\u6483\u7684\u3067\u30AE\u30B6\u30AE\u30B6\u3057\u305F\u8D64\u3044\u5C16\u5854",
  "\u9AD8\u3044\u67F1\u306E\u9593\u306B\u3072\u3063\u305D\u308A\u3068\u4F47\u3080\u3001\u5C45\u5FC3\u5730\u306E\u826F\u3044\u6696\u304B\u3044\u5C0F\u5C4B"
];
var DEFAULT_PALETTE = [
  "#FF3B30",
  "#0A84FF",
  "#30D158",
  "#FF9F0A",
  "#BF5AF2",
  "#FFD60A",
  "#E0F0FF"
];
function generateMockDirectorPlan(options = {}) {
  const {
    gridSize = DEFAULT_GRID_SIZE,
    minVoxels = 15,
    maxVoxels = 45,
    palette = DEFAULT_PALETTE,
    prompts = MOCK_PROMPTS
  } = options;
  const voxelCount = randomInt(minVoxels, maxVoxels);
  const voxels = [];
  const grid_size = [...gridSize];
  const vibe_prompt = prompts[randomInt(0, prompts.length - 1)];
  const usedPositions = /* @__PURE__ */ new Set();
  for (let i = 0; i < voxelCount; i++) {
    let pos;
    let posStr;
    const isGrounded = Math.random() > 0.3;
    do {
      pos = [
        randomInt(0, gridSize[0] - 1),
        isGrounded ? randomInt(0, 1) : randomInt(0, gridSize[1] - 1),
        randomInt(0, gridSize[2] - 1)
      ];
      posStr = pos.join(",");
    } while (usedPositions.has(posStr));
    usedPositions.add(posStr);
    const type = Math.random() > 0.8 ? "emissive" : "standard";
    const color = palette[randomInt(0, palette.length - 1)];
    voxels.push({ pos, color, type });
  }
  return {
    grid_size,
    voxels,
    vibe_vector: {
      warmth: randomInt(0, 4),
      density: randomInt(0, 4),
      focus: randomInt(0, 4),
      randomness: randomInt(0, 4),
      saturation: randomInt(0, 4),
      verticality: randomInt(0, 4)
    },
    vibe_prompt
  };
}

// src/validation.ts
function isValidVector3(v) {
  return Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number" && Number.isFinite(n));
}
function isValidVoxelType(v) {
  return typeof v === "string" && VOXEL_TYPES.includes(v);
}
function isValidHexColour(v) {
  return typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v);
}
function isValidVoxel(v, gridSize = DEFAULT_GRID_SIZE) {
  if (typeof v !== "object" || v === null) return false;
  const obj = v;
  return isValidVector3(obj.pos) && isWithinBounds(obj.pos, gridSize) && isValidHexColour(obj.color) && isValidVoxelType(obj.type);
}
function isValidVibeVector(v) {
  if (typeof v !== "object" || v === null) return false;
  const obj = v;
  const fields = ["warmth", "density", "focus", "randomness", "saturation", "verticality"];
  return fields.every(
    (f) => typeof obj[f] === "number" && obj[f] >= 0 && obj[f] <= 4
  );
}
function isValidDirectorPlan(v) {
  if (typeof v !== "object" || v === null) return false;
  const obj = v;
  return isValidVector3(obj.grid_size) && obj.grid_size.every((n) => Number.isInteger(n) && n >= 1) && Array.isArray(obj.voxels) && obj.voxels.every((vx) => isValidVoxel(vx, obj.grid_size)) && isValidVibeVector(obj.vibe_vector) && typeof obj.vibe_prompt === "string";
}





















exports.DEFAULT_GRID_SIZE = DEFAULT_GRID_SIZE; exports.DEFAULT_PALETTE = DEFAULT_PALETTE; exports.VOXEL_TYPES = VOXEL_TYPES; exports.calculateScores = calculateScores; exports.calculateStructureScore = calculateStructureScore; exports.createGridConfig = createGridConfig; exports.findVoxel = findVoxel; exports.generateMockDirectorPlan = generateMockDirectorPlan; exports.hasVoxelAt = hasVoxelAt; exports.isValidDirectorPlan = isValidDirectorPlan; exports.isValidHexColour = isValidHexColour; exports.isValidVector3 = isValidVector3; exports.isValidVibeVector = isValidVibeVector; exports.isValidVoxel = isValidVoxel; exports.isValidVoxelType = isValidVoxelType; exports.isWithinBounds = isWithinBounds; exports.placeVoxel = placeVoxel; exports.positionKey = positionKey; exports.positionsEqual = positionsEqual; exports.removeVoxel = removeVoxel;
