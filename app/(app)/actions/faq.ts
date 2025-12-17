"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { FAQ } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";

// Public: Get all FAQs
export async function getFAQs() {
    try {
        const faqs = await prisma.fAQ.findMany({
            orderBy: { order: 'asc' },
        });
        return { success: true, data: faqs };
    } catch (error) {
        console.error("Failed to fetch FAQs:", error);
        return { success: false, error: "Failed to fetch FAQs" };
    }
}

// Admin: Create FAQ
export async function createFAQ(data: { question: string; answer: string; category?: string; order?: number }) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const faq = await prisma.fAQ.create({
            data: {
                question: data.question,
                answer: data.answer,
                category: data.category || "General",
                order: data.order || 0,
            },
        });
        revalidatePath("/admin/faq");
        revalidatePath("/faq");
        return { success: true, data: faq };
    } catch (error) {
        return { success: false, error: "Failed to create FAQ" };
    }
}

// Admin: Bulk Create FAQs
export async function bulkCreateFAQs(faqs: { question: string; answer: string; category?: string; order?: number }[]) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const result = await prisma.fAQ.createMany({
            data: faqs.map(f => ({
                question: f.question,
                answer: f.answer,
                category: f.category || "General",
                order: f.order || 0,
            }))
        });
        revalidatePath("/admin/faq");
        revalidatePath("/faq");
        return { success: true, count: result.count };
    } catch (error) {
        return { success: false, error: "Failed to bulk create FAQs" };
    }
}

// Admin: Update FAQ
export async function updateFAQ(id: string, data: { question?: string; answer?: string; category?: string; order?: number }) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const faq = await prisma.fAQ.update({
            where: { id },
            data,
        });
        revalidatePath("/admin/faq");
        revalidatePath("/faq");
        return { success: true, data: faq };
    } catch (error) {
        return { success: false, error: "Failed to update FAQ" };
    }
}

// Admin: Reorder FAQs
export async function reorderFAQs(items: { id: string; order: number }[]) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        const transactions = items.map((item) =>
            prisma.fAQ.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        );
        await prisma.$transaction(transactions);
        
        revalidatePath("/admin/faq");
        revalidatePath("/faq");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reorder FAQs" };
    }
}

// Admin: Delete FAQ
export async function deleteFAQ(id: string) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { success: false, error: "Unauthorized" };

    try {
        await prisma.fAQ.delete({ where: { id } });
        revalidatePath("/admin/faq");
        revalidatePath("/faq");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete FAQ" };
    }
}

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { role: true }
    });

    return profile?.role === Role.ADMIN;
}
