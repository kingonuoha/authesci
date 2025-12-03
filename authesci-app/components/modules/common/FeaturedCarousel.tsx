"use client";

import { useEffect, useState } from "react";
import { searchPhotos } from "@/lib/services/pexels";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    alt: string;
}

interface Caption {
    title: string;
    subtitle: string;
}

interface FeaturedCarouselProps {
    query: string;
    captions?: Caption[];
    title?: string;
    subtitle?: string;
}

export function FeaturedCarousel({ query, captions, title, subtitle }: FeaturedCarouselProps) {
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchImages() {
            try {
                const data = await searchPhotos(query, 5);
                // Filter out photos that don't have a valid source
                const validPhotos = (data as unknown as PexelsPhoto[]).filter(
                    (photo) => photo && photo.src && photo.src.landscape
                );
                setPhotos(validPhotos);
            } catch (error) {
                console.error("Failed to load carousel images", error);
            } finally {
                setLoading(false);
            }
        }

        fetchImages();
    }, [query]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    if (loading) {
        return (
            <div className="w-full h-64 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        );
    }

    if (photos.length === 0) {
        return null; // Or return a fallback static banner
    }

    return (
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden group">
            {/* Slides */}
            <div
                className="absolute inset-0 transition-transform duration-500 ease-in-out flex"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {photos.map((photo, index) => {
                    // Determine text content: use specific caption for this index, or fallback to props, or photo alt
                    const currentCaption = captions && captions[index % captions.length];
                    const displayTitle = currentCaption?.title || title || "Explore Opportunities";
                    const displaySubtitle = currentCaption?.subtitle || subtitle || photo.alt || "Discover the latest in scientific research and collaboration.";

                    return (
                        <div key={photo.id} className="min-w-full h-full relative">
                            <Image
                                src={photo.src.landscape}
                                alt={photo.alt || "Featured Image"}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                    {displayTitle}
                                </h3>
                                <p className="text-neutral-200 max-w-xl">
                                    {displaySubtitle}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 right-4 flex gap-2">
                {photos.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
