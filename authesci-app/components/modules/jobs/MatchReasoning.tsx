import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface MatchReasoningProps {
    matchScore: number;
    reasoning?: string;
    keyMatches?: string[];
    missingSkills?: string[];
}

export function MatchReasoning({ matchScore, reasoning, keyMatches = [], missingSkills = [] }: MatchReasoningProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                    <Sparkles className="w-3 h-3" />
                    <span>{matchScore}% Match</span>
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Match Analysis
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Score Display */}
                    <div className="flex flex-col items-center justify-center py-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-900/50">
                        <div className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                            {matchScore}%
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Compatibility Score
                        </div>
                    </div>

                    {/* Reasoning */}
                    {reasoning && (
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-neutral-500" />
                                Summary
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
                                {reasoning}
                            </p>
                        </div>
                    )}

                    {/* Key Matches */}
                    {keyMatches.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Strong Matches
                            </h4>
                            <ul className="space-y-2">
                                {keyMatches.map((match, i) => (
                                    <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        {match}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Missing Skills */}
                    {missingSkills.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Missing / Low Match
                            </h4>
                            <ul className="space-y-2">
                                {missingSkills.map((skill, i) => (
                                    <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
