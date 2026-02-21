// src/schemas/voxel.schema.ts
var Vector3Schema = {
  type: "array",
  items: { type: "integer", minimum: 0 },
  minItems: 3,
  maxItems: 3,
  description: "Position as [x, y, z]"
};
var VoxelTypeSchema = {
  type: "string",
  enum: ["standard", "emissive", "transparent"],
  description: "Voxel material type"
};
var VoxelSchema = {
  type: "object",
  properties: {
    pos: Vector3Schema,
    color: {
      type: "string",
      pattern: "^#[0-9A-Fa-f]{6}$",
      description: "Hex colour in #RRGGBB format"
    },
    type: VoxelTypeSchema
  },
  required: ["pos", "color", "type"],
  additionalProperties: false
};

// src/schemas/vibe-vector.schema.ts
var vibeAxis = (description) => ({
  type: "number",
  minimum: 0,
  maximum: 4,
  description
});
var VibeVectorSchema = {
  type: "object",
  properties: {
    warmth: vibeAxis("0 = icy/clinical, 4 = cosy/warm"),
    density: vibeAxis("0 = sparse/empty, 4 = dense/packed"),
    focus: vibeAxis("0 = scattered, 4 = single focal point"),
    randomness: vibeAxis("0 = orderly/grid, 4 = chaotic"),
    saturation: vibeAxis("0 = monochrome, 4 = vivid colours"),
    verticality: vibeAxis("0 = flat/horizontal, 4 = tall/vertical")
  },
  required: ["warmth", "density", "focus", "randomness", "saturation", "verticality"],
  additionalProperties: false
};

// src/schemas/director-plan.schema.ts
var DirectorPlanSchema = {
  type: "object",
  properties: {
    grid_size: {
      type: "array",
      items: { type: "integer", minimum: 1 },
      minItems: 3,
      maxItems: 3,
      description: "Grid dimensions as [x, y, z]"
    },
    voxels: {
      type: "array",
      items: VoxelSchema,
      description: "List of voxels that form the target structure"
    },
    vibe_vector: VibeVectorSchema,
    vibe_prompt: {
      type: "string",
      description: "Natural-language description of the target vibe"
    }
  },
  required: ["grid_size", "voxels", "vibe_vector", "vibe_prompt"],
  additionalProperties: false
};
export {
  DirectorPlanSchema,
  Vector3Schema,
  VibeVectorSchema,
  VoxelSchema,
  VoxelTypeSchema
};
