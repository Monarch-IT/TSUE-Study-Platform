import { useCallback, useRef, useEffect, useState } from 'react';

// Simple sound effects using Web Audio API
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.1;
    }
    return audioContextRef.current;
  }, []);

  // Create cosmic whoosh sound for transitions
  const playTransitionSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = initAudio();
    if (!ctx || !gainNodeRef.current) return;

    // Create oscillator for whoosh
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(gainNodeRef.current);
    
    // Frequency sweep for cosmic effect
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  }, [initAudio, isMuted]);

  // Create subtle hover sound
  const playHoverSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = initAudio();
    if (!ctx || !gainNodeRef.current) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(gainNodeRef.current);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [initAudio, isMuted]);

  // Create click sound
  const playClickSound = useCallback(() => {
    if (isMuted) return;
    
    const ctx = initAudio();
    if (!ctx || !gainNodeRef.current) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(gainNodeRef.current);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }, [initAudio, isMuted]);

  // Start ambient cosmic music
  const startAmbientMusic = useCallback(() => {
    if (isPlaying || isMuted) return;
    
    const ctx = initAudio();
    if (!ctx || !gainNodeRef.current) return;

    // Create multiple oscillators for ambient sound
    const createAmbientLayer = (freq: number, type: OscillatorType, gainValue: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      
      // LFO for subtle modulation
      lfo.frequency.value = 0.1;
      lfoGain.gain.value = freq * 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainValue;
      
      osc.connect(gain);
      gain.connect(gainNodeRef.current!);
      
      lfo.start();
      osc.start();
      
      return { osc, lfo };
    };

    // Create ambient layers
    const layer1 = createAmbientLayer(60, 'sine', 0.03);
    const layer2 = createAmbientLayer(90, 'sine', 0.02);
    const layer3 = createAmbientLayer(120, 'triangle', 0.01);

    // Store reference for stopping
    ambientOscillatorRef.current = layer1.osc;
    
    setIsPlaying(true);
  }, [initAudio, isMuted, isPlaying]);

  // Stop ambient music
  const stopAmbientMusic = useCallback(() => {
    if (ambientOscillatorRef.current) {
      try {
        ambientOscillatorRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      ambientOscillatorRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (!prev) {
        stopAmbientMusic();
      }
      return !prev;
    });
  }, [stopAmbientMusic]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAmbientMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAmbientMusic]);

  return {
    playTransitionSound,
    playHoverSound,
    playClickSound,
    startAmbientMusic,
    stopAmbientMusic,
    toggleMute,
    isMuted,
    isPlaying
  };
}
