declare const Vector3Schema: {
    readonly type: "array";
    readonly items: {
        readonly type: "integer";
        readonly minimum: 0;
    };
    readonly minItems: 3;
    readonly maxItems: 3;
    readonly description: "Position as [x, y, z]";
};
declare const VoxelTypeSchema: {
    readonly type: "string";
    readonly enum: readonly ["standard", "emissive", "transparent"];
    readonly description: "Voxel material type";
};
declare const VoxelSchema: {
    readonly type: "object";
    readonly properties: {
        readonly pos: {
            readonly type: "array";
            readonly items: {
                readonly type: "integer";
                readonly minimum: 0;
            };
            readonly minItems: 3;
            readonly maxItems: 3;
            readonly description: "Position as [x, y, z]";
        };
        readonly color: {
            readonly type: "string";
            readonly pattern: "^#[0-9A-Fa-f]{6}$";
            readonly description: "Hex colour in #RRGGBB format";
        };
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["standard", "emissive", "transparent"];
            readonly description: "Voxel material type";
        };
    };
    readonly required: readonly ["pos", "color", "type"];
    readonly additionalProperties: false;
};

declare const VibeVectorSchema: {
    readonly type: "object";
    readonly properties: {
        readonly warmth: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
        readonly density: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
        readonly focus: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
        readonly randomness: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
        readonly saturation: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
        readonly verticality: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 4;
            readonly description: string;
        };
    };
    readonly required: readonly ["warmth", "density", "focus", "randomness", "saturation", "verticality"];
    readonly additionalProperties: false;
};

declare const DirectorPlanSchema: {
    readonly type: "object";
    readonly properties: {
        readonly grid_size: {
            readonly type: "array";
            readonly items: {
                readonly type: "integer";
                readonly minimum: 1;
            };
            readonly minItems: 3;
            readonly maxItems: 3;
            readonly description: "Grid dimensions as [x, y, z]";
        };
        readonly voxels: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly properties: {
                    readonly pos: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                        readonly minItems: 3;
                        readonly maxItems: 3;
                        readonly description: "Position as [x, y, z]";
                    };
                    readonly color: {
                        readonly type: "string";
                        readonly pattern: "^#[0-9A-Fa-f]{6}$";
                        readonly description: "Hex colour in #RRGGBB format";
                    };
                    readonly type: {
                        readonly type: "string";
                        readonly enum: readonly ["standard", "emissive", "transparent"];
                        readonly description: "Voxel material type";
                    };
                };
                readonly required: readonly ["pos", "color", "type"];
                readonly additionalProperties: false;
            };
            readonly description: "List of voxels that form the target structure";
        };
        readonly vibe_vector: {
            readonly type: "object";
            readonly properties: {
                readonly warmth: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
                readonly density: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
                readonly focus: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
                readonly randomness: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
                readonly saturation: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
                readonly verticality: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly maximum: 4;
                    readonly description: string;
                };
            };
            readonly required: readonly ["warmth", "density", "focus", "randomness", "saturation", "verticality"];
            readonly additionalProperties: false;
        };
        readonly vibe_prompt: {
            readonly type: "string";
            readonly description: "Natural-language description of the target vibe";
        };
    };
    readonly required: readonly ["grid_size", "voxels", "vibe_vector", "vibe_prompt"];
    readonly additionalProperties: false;
};

export { DirectorPlanSchema, Vector3Schema, VibeVectorSchema, VoxelSchema, VoxelTypeSchema };
