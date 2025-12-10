import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    variant?: "default" | "purple" | "cyan" | "warning" | "success";
    description?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, variant = "default", description }: StatsCardProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case "purple":
                return "bg-gradient-to-b from-purple-700 to-purple-400 text-white";
            case "cyan":
                return "bg-gradient-to-b from-info-700 to-info-400 text-white";
            case "warning":
                return "bg-gradient-to-b from-warning-700 to-warning-400 text-white";
            case "success":
                return "bg-gradient-to-b from-success-700 to-success-400 text-white";
            default:
                return "bg-white dark:bg-neutral-800";
        }
    };

    const isGradient = variant !== "default";

    return (
        <Card className={`overflow-hidden border-none shadow-md ${getVariantStyles()}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-medium ${isGradient ? "text-white/80" : "text-muted-foreground"}`}>
                            {title}
                        </p>
                        <h3 className={`text-2xl font-bold mt-2 ${isGradient ? "text-white" : "text-foreground"}`}>
                            {value}
                        </h3>
                        {description && (
                            <p className={`text-sm mt-1 ${isGradient ? "text-white/80" : "text-muted-foreground"}`}>
                                {description}
                            </p>
                        )}
                        {trend && (
                            <div className={`flex items-center mt-1 text-xs ${isGradient ? "text-white/90" : ""}`}>
                                <span
                                    className={`${trend.isPositive
                                        ? isGradient ? "text-white" : "text-green-600"
                                        : isGradient ? "text-white" : "text-red-600"
                                        } font-medium`}
                                >
                                    {trend.isPositive ? "+" : ""}{trend.value}%
                                </span>
                                <span className={`ml-1 ${isGradient ? "text-white/60" : "text-muted-foreground"}`}>
                                    from last month
                                </span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl ${isGradient ? "bg-white/20" : "bg-primary/10"}`}>
                        <Icon className={`w-6 h-6 ${isGradient ? "text-white" : "text-primary"}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
