"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getTransactions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return { error: "Profile not found" };

    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: profile.id },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: transactions };
    } catch (error) {
        console.error("Get transactions error:", error);
        return { error: "Failed to fetch transactions" };
    }
}
