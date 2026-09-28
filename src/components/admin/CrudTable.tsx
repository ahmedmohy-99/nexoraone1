import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "image" | "select";
  options?: string[];
};

type Table = "products" | "movies" | "services" | "portfolio";

export function CrudTable({
  table,
  fields,
  titleKey,
  publicKey,
}: {
  table: Table;
  fields: Field[];
  titleKey: string;
  publicKey: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [uploading, setUploading] = useState(false);

  const list = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Record<string, unknown>[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: [publicKey] });
  }

  async function save() {
    if (!editing) return;
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = editing[f.key];
      payload[f.key] = f.type === "number" ? (v === "" || v == null ? null : Number(v)) : (v ?? "");
    }
    const id = editing["id"] as string | undefined;
    const { error } = id
      ? await supabase.from(table).update(payload as never).eq("id", id)
      : await supabase.from(table).insert(payload as never);
    if (error) { toast.error("تعذّر الحفظ: " + error.message); return; }
    toast.success("تم الحفظ");
    setEditing(null);
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("هل تريد الحذف؟")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("تعذّر الحذف"); return; }
    toast.success("تم الحذف");
    refresh();
  }

  async function upload(file: File, key: string) {
    setUploading(true);
    const path = `${table}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    setUploading(false);
    if (error) { toast.error("تعذّر رفع الصورة"); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setEditing((e) => ({ ...(e ?? {}), [key]: data.publicUrl }));
  }

  return (
    <div>
      <Button variant="hero" onClick={() => setEditing({})}>
        <Plus /> إضافة
      </Button>
      <div className="mt-4 space-y-3">
        {(list.data ?? []).map((row) => {
          const img = fields.find((f) => f.type === "image");
          return (
            <div key={row["id"] as string} className="glass flex items-center gap-4 rounded-2xl p-3">
              {img && row[img.key] ? (
                <img src={row[img.key] as string} alt="" className="size-14 rounded-xl object-cover" />
              ) : null}
              <span className="flex-1 font-semibold">{String(row[titleKey] ?? "")}</span>
              <Button size="icon" variant="ghost" onClick={() => setEditing(row)}>
                <Pencil />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(row["id"] as string)}>
                <Trash2 />
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? "تعديل" : "إضافة جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    value={String(editing?.[f.key] ?? "")}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                ) : f.type === "select" ? (
                  <select
                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                    value={String(editing?.[f.key] ?? f.options?.[0] ?? "")}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  >
                    {f.options?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === "image" ? (
                  <div className="space-y-2">
                    {editing?.[f.key] ? (
                      <img src={String(editing[f.key])} alt="" className="h-32 rounded-xl object-cover" />
                    ) : null}
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], f.key)}
                    />
                    <Input
                      dir="ltr"
                      placeholder="أو ضع رابط الصورة"
                      value={String(editing?.[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    />
                  </div>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    step="any"
                    value={String(editing?.[f.key] ?? "")}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <Button variant="hero" className="w-full" disabled={uploading} onClick={save}>
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
