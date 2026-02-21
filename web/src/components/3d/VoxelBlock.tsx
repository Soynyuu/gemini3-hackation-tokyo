import { useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type { Vector3, VoxelType } from '../../store/types';
import * as THREE from 'three';

interface VoxelBlockProps {
    position: Vector3;
    color: string;
    type: VoxelType;
    onClick?: (pos: Vector3, faceNormal: Vector3) => void;
    onPointerContextMenu?: (pos: Vector3) => void;
    isGhost?: boolean;
}

export const VoxelBlock = ({
    position,
    color,
    type,
    onClick,
    onPointerContextMenu,
    isGhost = false
}: VoxelBlockProps) => {
    const [hovered, setHovered] = useState(false);

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (onClick && e.face) {
            onClick(position, [e.face.normal.x, e.face.normal.y, e.face.normal.z]);
        }
    };

    const handleContextMenu = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (onPointerContextMenu) {
            onPointerContextMenu(position);
        }
    };

    const emissiveIntensity = type === 'emissive' ? 2 : 0;
    const opacity = isGhost ? 0.4 : (type === 'transparent' ? 0.6 : 1);
    const transparent = isGhost || type === 'transparent';

    return (
        <mesh
            position={position}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={hovered && !isGhost ? '#ffffff' : color}
                emissive={color}
                emissiveIntensity={hovered && !isGhost ? emissiveIntensity + 0.5 : emissiveIntensity}
                transparent={transparent}
                opacity={opacity}
                roughness={0.2}
                metalness={0.8}
            />
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(1.01, 1.01, 1.01)]} />
                <lineBasicMaterial color={isGhost ? '#00FFAA' : '#1E2D3D'} linewidth={2} transparent={transparent} opacity={isGhost ? 0.5 : 0.8} />
            </lineSegments>
        </mesh>
    );
};
