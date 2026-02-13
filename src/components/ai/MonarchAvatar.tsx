import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * MonarchAvatar 4.0: Liquid Soul
 * Simplified back to the "Organic Sphere" form but with 
 * enhanced liquid wobbling and dynamic eye tracking.
 */
export const MonarchAvatar = ({ size = 40, isThinking = false }: { size?: number, isThinking?: boolean }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
            {/* Liquid Body */}
            <motion.div
                animate={{
                    borderRadius: isThinking
                        ? ["50% 50% 50% 50%", "30% 70% 40% 60%", "60% 40% 70% 30%", "50% 50% 50% 50%"]
                        : ["48% 52% 52% 48%", "52% 48% 48% 52%", "50% 50% 50% 50%", "48% 52% 52% 48%"],
                    scale: isThinking ? [1, 1.1, 1] : 1,
                    rotate: isThinking ? [0, 5, -5, 0] : 0
                }}
                transition={{
                    duration: isThinking ? 2 : 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative z-10 w-full h-full bg-black shadow-[inset_0_4px_12px_rgba(255,255,255,0.2),0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden border border-white/5"
            >
                {/* Glossy Overlay */}
                <div className="absolute top-1 left-2 w-1/3 h-1/4 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-[1px]" />

                {/* Animated Eyes (Following Mouse) */}
                <motion.div
                    animate={{
                        x: mousePos.x,
                        y: mousePos.y,
                        scale: isThinking ? [1, 1.2, 1] : 1
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className="flex gap-1.5"
                >
                    <motion.div
                        animate={{
                            height: [4, 4, 0.5, 4],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 5
                        }}
                        className="w-2 h-4 bg-white rounded-full shadow-[0_0_8px_#fff]"
                    />
                    <motion.div
                        animate={{
                            height: [4, 4, 0.5, 4],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: 0.1,
                            repeatDelay: Math.random() * 5
                        }}
                        className="w-2 h-4 bg-white rounded-full shadow-[0_0_8px_#fff]"
                    />
                </motion.div>

                {/* Internal Glow (Liquid Effect) */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent blur-md" />
            </motion.div>

            {/* Subtle Aura Ring (The pinkish particle halo) */}
            <motion.div
                animate={{
                    rotate: 360,
                    scale: isThinking ? 1.25 : 1.1,
                }}
                transition={{
                    rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-[-20%] opacity-40 pointer-events-none"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full filter blur-[0.5px]">
                    <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="0.5"
                        strokeDasharray="2 6"
                        strokeLinecap="round"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 50 50"
                            to="-360 50 50"
                            dur="20s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </svg>
            </motion.div>

            {/* Thinking Particles */}
            {isThinking && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.5],
                                opacity: [0, 0.5, 0],
                                y: [-10, -30],
                                x: [0, (i - 1) * 10]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.4
                            }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 bg-primary rounded-full blur-[1px]"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
