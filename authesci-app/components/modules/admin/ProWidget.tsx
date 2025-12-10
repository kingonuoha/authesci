"use client";

import { useEffect, useState } from "react";
import { Zap, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProWidget() {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white p-6 shadow-xl border border-neutral-800"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Animated Background Glow */}
            <div
                className={`absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] transition-all duration-1000 ${hovered ? 'scale-125 opacity-30' : 'scale-100 opacity-20'}`}
                style={{ transform: 'translate(30%, -30%)' }}
            />
            <div
                className={`absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] transition-all duration-1000 ${hovered ? 'scale-125 opacity-30' : 'scale-100 opacity-20'}`}
                style={{ transform: 'translate(-30%, 30%)' }}
            />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-2 shadow-lg shadow-orange-500/20">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                        Authesci Pro
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/10">
                        Coming Soon
                    </span>
                </div>

                <p className="text-neutral-400 text-sm mb-6 leading-relaxed max-w-sm">
                    Unlock the full potential of your research workflow with advanced analytics,
                    priority support, and unlimited project collaborations.
                    <span className="block mt-2 text-white font-medium">
                        Perform better. Collaborate faster.
                    </span>
                </p>

                <div className="flex items-center gap-3">
                    <Button
                        className="relative group overflow-hidden bg-white text-black hover:bg-neutral-200 transition-all font-semibold"
                        size="lg"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Subscribe to Pro
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
                        </span>

                        {/* Coming Soon Overlay */}
                        <div className="absolute inset-0 bg-neutral-900/90 text-white flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-xs font-medium uppercase tracking-widest flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Coming Soon
                            </span>
                        </div>
                    </Button>

                    <div className={`text-xs text-neutral-500 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                        Limited spots available at launch
                    </div>
                </div>
            </div>
        </div>
    );
}
