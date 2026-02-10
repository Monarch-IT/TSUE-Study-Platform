import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ModuleAnimationsProps {
    type?: 'snake' | 'galaxy' | 'code' | 'atoms';
    color?: string;
}

export const ModuleAnimations = ({ type, color = '#3776ab' }: ModuleAnimationsProps) => {
    if (!type) return null;

    switch (type) {
        case 'snake':
            return <SnakeAnimation color={color} />;
        case 'galaxy':
            return <GalaxyAnimation color={color} />;
        default:
            return null;
    }
};

const SnakeAnimation = ({ color }: { color: string }) => {
    return (
        <div className="relative w-full h-32 sm:h-48 flex items-center justify-center overflow-hidden rounded-2xl bg-black/20 border border-white/5">
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${color}40, transparent 70%)`
            }} />

            <svg width="400" height="200" viewBox="0 0 400 200" className="relative z-10 w-full max-w-md">
                {/* Snake Body Path */}
                <motion.path
                    d="M 50 100 Q 100 50 150 100 T 250 100 T 350 100"
                    fill="none"
                    stroke={color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: 1,
                        opacity: 1,
                        d: [
                            "M 50 100 Q 100 50 150 100 T 250 100 T 350 100",
                            "M 50 100 Q 100 150 150 100 T 250 100 T 350 100",
                            "M 50 100 Q 100 50 150 100 T 250 100 T 350 100"
                        ]
                    }}
                    transition={{
                        pathLength: { duration: 2, ease: "easeInOut" },
                        opacity: { duration: 0.5 },
                        d: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                />

                {/* Eye */}
                <motion.circle
                    cx="355"
                    cy="95"
                    r="2"
                    fill="white"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                />

                {/* Floating Particles */}
                {[...Array(10)].map((_, i) => (
                    <motion.circle
                        key={i}
                        cx={50 + Math.random() * 300}
                        cy={50 + Math.random() * 100}
                        r={1 + Math.random() * 2}
                        fill={color}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            y: [-10, 10],
                            x: [-5, 5]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </svg>

            <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
                    Neural Core Protocol: Python
                </span>
            </div>
        </div>
    );
};

const GalaxyAnimation = ({ color }: { color: string }) => {
    return (
        <div className="relative w-full h-32 sm:h-48 flex items-center justify-center overflow-hidden rounded-2xl bg-black/20 border border-white/5">
            <motion.div
                className="w-32 h-32 rounded-full blur-3xl opacity-30"
                animate={{
                    scale: [1, 1.5, 1],
                    backgroundColor: [color, "#ffffff", color]
                }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{
                            x: 0,
                            y: 0,
                            opacity: 0
                        }}
                        animate={{
                            x: (Math.random() - 0.5) * 300,
                            y: (Math.random() - 0.5) * 200,
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
