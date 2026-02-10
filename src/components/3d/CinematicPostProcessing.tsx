import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function CinematicPostProcessing() {
    return (
        <EffectComposer disableNormalPass>
            <Bloom
                intensity={2.5}
                luminanceThreshold={0.1}
                luminanceSmoothing={0.9}
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={[0.0008, 0.0008]}
            />
            <Noise
                opacity={0.03}
                blendFunction={BlendFunction.OVERLAY}
            />
            <Vignette
                offset={0.3}
                darkness={0.65}
            />
        </EffectComposer>
    );
}
