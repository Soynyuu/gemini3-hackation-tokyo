import { VoxelSchema } from './voxel.schema.js';
import { VibeVectorSchema } from './vibe-vector.schema.js';

export const DirectorPlanSchema = {
  type: 'object',
  properties: {
    grid_size: {
      type: 'array',
      items: { type: 'integer', minimum: 1 },
      minItems: 3,
      maxItems: 3,
      description: 'Grid dimensions as [x, y, z]',
    },
    voxels: {
      type: 'array',
      items: VoxelSchema,
      description: 'List of voxels that form the target structure',
    },
    vibe_vector: VibeVectorSchema,
    vibe_prompt: {
      type: 'string',
      description: 'Natural-language description of the target vibe',
    },
  },
  required: ['grid_size', 'voxels', 'vibe_vector', 'vibe_prompt'],
  additionalProperties: false,
} as const;
