import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import type { Vector3, Voxel, VoxelType } from '../../store/types';
import { VoxelBlock } from './VoxelBlock';

interface VoxelGridProps {
    activeColor: string;
    activeType: VoxelType;
    readOnly?: boolean;
    voxels?: Voxel[];
    highlightLayer?: number;
}

export const VoxelGrid = ({ activeColor, activeType, readOnly = false, voxels, highlightLayer }: VoxelGridProps) => {
    const storeVoxels = useGameStore(state => state.playerVoxels);
    const addVoxel = useGameStore(state => state.addVoxel);
    const removeVoxel = useGameStore(state => state.removeVoxel);

    const displayVoxels = voxels || storeVoxels;

    const [ghostPos, setGhostPos] = useState<Vector3 | null>(null);

    const handleBlockClick = (pos: Vector3, normal: Vector3) => {
        if (readOnly) return;
        const newPos: Vector3 = [
            pos[0] + normal[0],
            pos[1] + normal[1],
            pos[2] + normal[2]
        ];
        if (newPos[0] >= 0 && newPos[0] < 5 &&
            newPos[1] >= 0 && newPos[1] < 5 &&
            newPos[2] >= 0 && newPos[2] < 5) {
            addVoxel({ pos: newPos, color: activeColor, type: activeType });
        }
    };

    const handleBlockContextMenu = (pos: Vector3) => {
        if (readOnly) return;
        removeVoxel(pos);
        setGhostPos(null);
    };

    return (
        <group position={[-2, 0, -2]}>
            <mesh
                position={[2, -0.5, 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                    if (readOnly) return;
                    e.stopPropagation();
                    const intersect = e.intersections[0];
                    if (intersect) {
                        const p = intersect.point;
                        const gx = Math.floor(p.x + 2.5);
                        const gz = Math.floor(p.z + 2.5);
                        if (gx >= 0 && gx < 5 && gz >= 0 && gz < 5) {
                            setGhostPos([gx, 0, gz]);
                        }
                    }
                }}
                onClick={(e: ThreeEvent<MouseEvent>) => {
                    if (readOnly || !ghostPos) return;
                    e.stopPropagation();
                    if (ghostPos[1] === 0) {
                        addVoxel({ pos: ghostPos, color: activeColor, type: activeType });
                    }
                }}
                onPointerOut={() => setGhostPos(null)}
            >
                <planeGeometry args={[5, 5]} />
                <meshBasicMaterial visible={false} />
            </mesh>

            <gridHelper args={[5, 5, '#1E2D3D', '#0A121A']} position={[2, -0.5, 2]} />

            {displayVoxels.map((v, i) => (
                <VoxelBlock
                    key={`${v.pos.join(',')}-${i}`}
                    position={v.pos}
                    color={v.color}
                    type={v.type}
                    onClick={handleBlockClick}
                    onPointerContextMenu={handleBlockContextMenu}
                />
            ))}

            {!readOnly && ghostPos && (
                <VoxelBlock
                    position={ghostPos}
                    color={activeColor}
                    type={activeType}
                    isGhost
                />
            )}

            {highlightLayer !== undefined && (
                <mesh position={[2, highlightLayer, 2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[5, 5]} />
                    <meshBasicMaterial color="#00FFAA" transparent opacity={0.12} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
};
