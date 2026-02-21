export const Vector3Schema = {
  type: 'array',
  items: { type: 'integer', minimum: 0 },
  minItems: 3,
  maxItems: 3,
  description: 'Position as [x, y, z]',
} as const;

export const VoxelTypeSchema = {
  type: 'string',
  enum: ['standard', 'emissive', 'transparent'],
  description: 'Voxel material type',
} as const;

export const VoxelSchema = {
  type: 'object',
  properties: {
    pos: Vector3Schema,
    color: {
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$',
      description: 'Hex colour in #RRGGBB format',
    },
    type: VoxelTypeSchema,
  },
  required: ['pos', 'color', 'type'],
  additionalProperties: false,
} as const;
