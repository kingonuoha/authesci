import { InLabWaitlistForm } from "@/components/modules/public/InLabWaitlistForm";
import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Globe2, Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "In-Lab Mode [Experimental] | Authesci",
    description: "Experience the next evolution of scientific collaboration. Physical lab access and virtual workspaces in one futuristic platform.",
};

export default function InLabPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[90px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
                {/* Navigation */}
                <div className="mb-12 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link
                        href="/scientist/dashboard"
                        className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all hover:scale-105"
                    >
                        <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <span className="text-xs font-medium text-purple-200 uppercase tracking-wider">Experimental Access</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Content */}
                    <div className="space-y-8 animate-in slide-in-from-left-8 duration-700 delay-150">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 pb-2">
                                In-Lab <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Intelligence.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
                                The boundary between physical research and digital collaboration is dissolving. Welcome to the future of scientific workflow.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors backdrop-blur-md group">
                                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors">
                                    <FlaskConical className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Physical Collaboration</h3>
                                <p className="text-sm text-slate-400">
                                    Book lab slots, request equipment access, and manage on-site safety protocols digitally.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors backdrop-blur-md group">
                                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                                    <Globe2 className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Virtual Labs</h3>
                                <p className="text-sm text-slate-400">
                                    Join immersive collaboration rooms with integrated video, whiteboards, and data sharing.
                                </p>
                            </div>
                        </div>

                        {/* Waitlist Section */}
                        <div className="pt-4">
                            <div className="p-1 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                                <div className="bg-slate-900/90 rounded-xl p-6 backdrop-blur-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-lg text-white font-semibold">Join the Beta Waitlist</h3>
                                    </div>
                                    <InLabWaitlistForm />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="relative animate-in slide-in-from-right-8 duration-700 delay-300 hidden lg:block">
                        <div className="relative aspect-square max-w-lg mx-auto">
                            {/* Decorative Rings */}
                            <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-4 rounded-full border border-blue-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>

                            {/* Main Image Container */}
                            <div className="absolute inset-8 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-sm">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/assets/images/coming-soon/coming-soon.png" // Using the existing asset
                                        alt="In-Lab Interface Preview"
                                        fill
                                        className="object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                                    {/* Floating UI Elements (mockup) */}
                                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="h-2 w-24 bg-purple-500/50 rounded-full"></div>
                                            <div className="h-4 w-4 rounded-full bg-green-500/50"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-white/10 rounded-full"></div>
                                            <div className="h-2 w-2/3 bg-white/10 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section - Mobile Visual */}
                <div className="mt-16 lg:hidden relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image
                        src="/assets/images/coming-soon/coming-soon.png"
                        alt="In-Lab Interface"
                        fill
                        className="object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                        <p className="text-white font-medium">Coming to Mobile & Desktop</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
