"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, Save, X, GripVertical, FileJson, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createFAQ, updateFAQ, deleteFAQ, reorderFAQs, bulkCreateFAQs, getFAQs } from "@/app/(app)/actions/faq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
    category: string;
}

interface FaqManagerProps {
    faqs: FAQ[];
}

function SortableRow({ faq, onEdit, onDelete }: { faq: FAQ; onEdit: (f: FAQ) => void; onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: faq.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className="border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 bg-white dark:bg-neutral-800"
        >
            <td className="p-4 w-12 cursor-move touch-none" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4 text-neutral-400" />
            </td>
            <td className="p-4 font-medium">{faq.question}</td>
            <td className="p-4"><span className="badge bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded text-xs">{faq.category}</span></td>
            <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(faq)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(faq.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export default function FaqManager({ faqs: initialFaqs }: FaqManagerProps) {
    const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
    const [isEditing, setIsEditing] = useState<string | null>(null); // 'new', 'bulk', or faq.id
    const [isLoading, setIsLoading] = useState(false);
    const [bulkJson, setBulkJson] = useState("");

    // Form handling
    const { register, handleSubmit, reset, setValue } = useForm<Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setFaqs(initialFaqs.sort((a, b) => a.order - b.order));
    }, [initialFaqs]);

    const handleEdit = (faq: FAQ) => {
        setIsEditing(faq.id);
        setValue("question", faq.question);
        setValue("answer", faq.answer);
        setValue("order", faq.order);
        setValue("category", faq.category);
    };

    const handleCancel = () => {
        setIsEditing(null);
        setBulkJson("");
        reset();
    };

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            if (isEditing === "new") {
                const res = await createFAQ({ ...data, order: Number(data.order) });
                if (res.success && res.data) {
                    setFaqs([...faqs, res.data as any].sort((a, b) => a.order - b.order));
                    toast.success("FAQ created");
                    handleCancel();
                } else {
                    toast.error(res.error || "Failed");
                }
            } else if (isEditing && isEditing !== "bulk") {
                const res = await updateFAQ(isEditing, { ...data, order: Number(data.order) });
                if (res.success && res.data) {
                    setFaqs(faqs.map(f => f.id === isEditing ? res.data as any : f).sort((a, b) => a.order - b.order));
                    toast.success("FAQ updated");
                    handleCancel();
                } else {
                    toast.error(res.error || "Failed");
                }
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkJson) return;
        setIsLoading(true);
        try {
            let parsed;
            try {
                parsed = JSON.parse(bulkJson);
                if (!Array.isArray(parsed)) throw new Error("Not an array");
            } catch (e) {
                toast.error("Invalid JSON format. Expected an array of objects.");
                setIsLoading(false);
                return;
            }

            const res = await bulkCreateFAQs(parsed);
            if (res.success) {
                toast.success(`Successfully added ${res.count} FAQs`);
                // Refresh list
                const refreshed = await getFAQs();
                if (refreshed.success && refreshed.data) {
                    setFaqs(refreshed.data as any);
                }
                handleCancel();
            } else {
                toast.error(res.error || "Bulk create failed");
            }
        } catch (e) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsLoading(true);
        try {
            const res = await deleteFAQ(id);
            if (res.success) {
                setFaqs(faqs.filter(f => f.id !== id));
                toast.success("FAQ deleted");
            } else {
                toast.error(res.error || "Failed");
            }
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = faqs.findIndex((i) => i.id === active.id);
            const newIndex = faqs.findIndex((i) => i.id === over?.id);

            const newItems = arrayMove(faqs, oldIndex, newIndex);
            setFaqs(newItems);

            // Update order in DB
            const updates = newItems.map((item, index) => ({
                id: item.id,
                order: index
            }));

            try {
                await reorderFAQs(updates);
            } catch (error) {
                toast.error("Failed to save order");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h2 className="text-xl font-bold">Manage FAQs</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => { setIsEditing("bulk"); setBulkJson(""); }} variant="outline" className="flex-1 sm:flex-none">
                        <FileJson className="w-4 h-4 mr-2" />
                        Bulk Import
                    </Button>
                    <Button onClick={() => { setIsEditing("new"); reset(); }} className="flex-1 sm:flex-none">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New FAQ
                    </Button>
                </div>
            </div>

            {/* Edit / New Modal Area */}
            {isEditing && isEditing !== "bulk" && (
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4">{isEditing === "new" ? "New FAQ" : "Edit FAQ"}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Question</label>
                                <Input {...register("question", { required: true })} placeholder="E.g. How to reset password?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <Input {...register("category")} placeholder="General" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Order</label>
                                <Input type="number" {...register("order")} placeholder="0" defaultValue={0} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Answer</label>
                            <Textarea {...register("answer", { required: true })} placeholder="Detailed answer..." rows={4} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save FAQ"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bulk Import Modal Area */}
            {isEditing === "bulk" && (
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Bulk Import FAQs</h3>
                            <p className="text-sm text-neutral-500">Paste a JSON array of FAQ objects.</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancel}><X className="w-4 h-4" /></Button>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded mb-4 text-xs font-mono text-neutral-600 dark:text-neutral-400 overflow-x-auto">
                        <pre>{`[
  {
    "question": "What is Authesci?",
    "answer": "Authesci is a platform...",
    "category": "General"
  },
  {
    "question": "How to apply?",
    "answer": "Go to jobs page...",
    "category": "Jobs"
  }
]`}</pre>
                    </div>

                    <Textarea
                        value={bulkJson}
                        onChange={(e) => setBulkJson(e.target.value)}
                        placeholder="Paste JSON here..."
                        rows={10}
                        className="font-mono text-sm mb-4"
                    />

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button type="button" onClick={handleBulkSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Import FAQs
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <table className="w-full">
                        <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                            <tr>
                                <th className="text-left p-4 w-12"></th>
                                <th className="text-left p-4 font-medium text-neutral-500">Question</th>
                                <th className="text-left p-4 font-medium text-neutral-500">Category</th>
                                <th className="text-right p-4 font-medium text-neutral-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SortableContext
                                items={faqs.map(f => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {faqs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-neutral-500">No FAQs found.</td>
                                    </tr>
                                ) : (
                                    faqs.map((faq) => (
                                        <SortableRow
                                            key={faq.id}
                                            faq={faq}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                )}
                            </SortableContext>
                        </tbody>
                    </table>
                </DndContext>
            </div>
        </div>
    );
}
