'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { authSlides } from './auth-slides';
import { cn } from '@/lib/utils';

const SLIDE_DURATION = 15000; // 15 seconds

const AuthCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // Use refs to access video elements to control playback if needed, though simple loop attribute works for short videos
    // For specific requirement "if video is shorter than 15s, loop it", standard HTML5 loop attribute takes care of replaying.
    // The master interval will force the slide change regardless.

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % authSlides.length);
        }, SLIDE_DURATION);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-black">
            {/* Background Media */}
            {authSlides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={cn(
                        "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                        index === currentSlide ? "opacity-100" : "opacity-0"
                    )}
                >
                    {slide.type === 'image' ? (
                        <div className={cn(
                            "w-full h-full relative overflow-hidden",
                            // Only animate scale if it is the current slide to reset the animation when returning
                            index === currentSlide ? "animate-ken-burns" : ""
                        )}>
                            <Image
                                src={slide.src}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    ) : (
                        <video
                            src={slide.src}
                            className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            muted
                            loop // Loops automatically if shorter than the interval
                            playsInline
                        />
                    )}
                </div>
            ))}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Text Overlay */}
            <div className="absolute inset-0 z-[2] flex flex-col justify-end p-12 lg:p-20 pointer-events-none">
                <div className="max-w-2xl mb-12">
                    {authSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={cn(
                                "transition-all duration-700 ease-in-out absolute bottom-32 opacity-0 translate-y-4",
                                index === currentSlide ? "opacity-100 translate-y-0 relative bottom-0" : ""
                            )}
                        >
                            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-lg lg:text-xl text-neutral-200 font-medium max-w-lg">
                                {slide.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Indicators */}
                <div className="flex gap-3 pointer-events-auto">
                    {authSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @keyframes ken-burns {
                    0% {
                        transform: scale(1);
                    }
                    100% {
                        transform: scale(1.1);
                    }
                }
                .animate-ken-burns {
                    animation: ken-burns ${SLIDE_DURATION}ms linear forwards;
                }
            `}</style>
        </div>
    );
};

export default AuthCarousel;
