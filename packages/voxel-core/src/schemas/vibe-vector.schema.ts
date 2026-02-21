const vibeAxis = (description: string) =>
  ({
    type: 'number',
    minimum: 0,
    maximum: 4,
    description,
  }) as const;

export const VibeVectorSchema = {
  type: 'object',
  properties: {
    warmth: vibeAxis('0 = icy/clinical, 4 = cosy/warm'),
    density: vibeAxis('0 = sparse/empty, 4 = dense/packed'),
    focus: vibeAxis('0 = scattered, 4 = single focal point'),
    randomness: vibeAxis('0 = orderly/grid, 4 = chaotic'),
    saturation: vibeAxis('0 = monochrome, 4 = vivid colours'),
    verticality: vibeAxis('0 = flat/horizontal, 4 = tall/vertical'),
  },
  required: ['warmth', 'density', 'focus', 'randomness', 'saturation', 'verticality'],
  additionalProperties: false,
} as const;
