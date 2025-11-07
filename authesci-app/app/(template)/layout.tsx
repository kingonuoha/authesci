import AppLayout from "@/components/modules/AppLayout";

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
