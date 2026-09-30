import { useGLTF, Text, Float, MeshTransmissionMaterial } from '@react-three/drei'
import React from 'react'
import { useThree } from '@react-three/fiber'

export default function Model() {
    const { viewport } = useThree()
    const { nodes } = useGLTF('/medias/shards.glb')

    const isPortrait = viewport.aspect < 1.0 || viewport.width < 1.1
    const responsiveScale = isPortrait 
        ? Math.max(viewport.width / 0.85, viewport.height / 1.1)
        : viewport.width / 1.5
    
    return (
        <group scale={responsiveScale}>
            {
                nodes.Scene.children.map((mesh, i) => {
                    return <Mesh data={mesh} key={i}/>
                })
            }
            <Font isPortrait={isPortrait} />
        </group>
    )
}

function Font({ isPortrait }) {
    const src = '/fonts/PPNeueMontreal-Regular.ttf'
    const textOption = {
        color: "white",
        anchorX: "center",
        anchorY: "middle"
    }

    const titleSize = isPortrait ? 0.075 : 0.16
    const titleY = isPortrait ? 0.032 : 0.04
    const subSize = isPortrait ? 0.034 : 0.06
    const subY = isPortrait ? -0.042 : -0.09

    return (
        <group>
            <Text 
                font={src} 
                position={[0, titleY, -.1]} 
                fontSize={titleSize} 
                letterSpacing={-0.02} 
                {...textOption}
            >
                DavinciWale
            </Text>
            <Text 
                font={src} 
                position={[0, subY, -.1]} 
                fontSize={subSize} 
                letterSpacing={0.12} 
                {...textOption}
            >
                Bhaiya
            </Text>
        </group>
    )
}

function Mesh({data}) {
    const materialProps = {
        thickness: 0.275,
        ior: 1.8,
        chromaticAberration: 0.75,
        resolution: 300,
    }

    return (
        <Float rotationIntensity={0.6} floatIntensity={0.8}>
            <mesh {...data}>
                <MeshTransmissionMaterial roughness={0} transmission={0.99} {...materialProps}/>
            </mesh>
        </Float>
    )
}
