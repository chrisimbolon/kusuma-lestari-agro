// src/features/inventory/pages/CategoriesPage.tsx
import { useState, useEffect } from "react";
import PageHeader from "../../../components/shared/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import Modal from "../../../components/ui/Modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../lib/axios";
import type { ProductCategory } from "../../../types/inventory";

// ── Hooks ─────────────────────────────────────────────────────

function useCats() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories/").then(r => {
      const d = r.data;
      return (d?.results ?? d ?? []) as ProductCategory[];
    }),
  });
}

function useCatCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name: string; description: string }) =>
      api.post("/categories/", data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

function useCatUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/categories/${id}/`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

function useCatDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

// ── Modal ─────────────────────────────────────────────────────

type FormState = { code: string; name: string; description: string };
const EMPTY: FormState = { code: "", name: "", description: "" };

function CatModal({ open, onClose, editing }: {
  open: boolean;
  onClose: () => void;
  editing: ProductCategory | null;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const create = useCatCreate();
  const update = useCatUpdate();

  // ✅ Reset form every time modal opens or editing target changes
  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? { code: editing.code, name: editing.name, description: editing.description ?? "" }
        : EMPTY
    );
    create.reset();
    update.reset();
  }, [open, editing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      onClose();
    } catch {
      // error shown in UI
    }
  };

  const isPending = create.isPending || update.isPending;
  const isError   = create.isError   || update.isError;
  const errorMsg  =
    (create.error as any)?.response?.data?.code?.[0] ??
    (create.error as any)?.response?.data?.detail ??
    (update.error as any)?.response?.data?.detail ??
    "Gagal menyimpan. Periksa kode unik.";

  const field = (label: string, key: keyof FormState, placeholder = "") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display:"block", fontSize:12, fontWeight:600, color:"#4a6a4a",
        marginBottom:5, textTransform:"uppercase", letterSpacing:"0.05em",
      }}>
        {label}
      </label>
      <input
        value={form[key]}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{
          width:"100%", boxSizing:"border-box", padding:"9px 12px",
          border:"1.5px solid #e0dbd0", borderRadius:8,
          fontFamily:"'Instrument Sans',sans-serif", fontSize:14,
          color:"#1a2e1a", background:"#faf9f7", outline:"none",
        }}
        onFocus={e => e.target.style.borderColor = "#2d5a1e"}
        onBlur={e  => e.target.style.borderColor = "#e0dbd0"}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Kategori" : "Tambah Kategori"}
      width={440}
    >
      {field("Kode", "code", "CAT-NPK")}
      {field("Nama Kategori", "name", "Pupuk NPK")}
      {field("Deskripsi", "description", "Opsional...")}

      {isError && (
        <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>
          ⚠ {errorMsg}
        </p>
      )}

      <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:8 }}>
        {/* ✅ type="button" prevents accidental form submission */}
        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          loading={isPending}
          disabled={!form.code.trim() || !form.name.trim()}
        >
          {editing ? "Simpan Perubahan" : "Tambah Kategori"}
        </Button>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { data: cats = [], isLoading } = useCats();
  const del = useCatDelete();
  const [modal, setModal] = useState<{ open: boolean; editing: ProductCategory | null }>({
    open: false, editing: null,
  });

  const openCreate = () => setModal({ open: true,  editing: null });
  const openEdit   = (cat: ProductCategory) => setModal({ open: true, editing: cat });
  const closeModal = () => setModal({ open: false, editing: null });

  const handleDelete = (cat: ProductCategory) => {
    if (window.confirm(`Hapus kategori "${cat.name}"?`)) {
      del.mutate(cat.id);
    }
  };

  const columns = [
    {
      key:"code", header:"Kode",
      render:(r: ProductCategory) => (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#2d5a1e", fontWeight:600 }}>
          {r.code}
        </span>
      ),
    },
    { key:"name", header:"Nama Kategori" },
    {
      key:"description", header:"Deskripsi",
      render:(r: ProductCategory) => (
        <span style={{ color:"#7a9a7a" }}>{r.description || "—"}</span>
      ),
    },
    {
      key:"product_count", header:"Produk", align:"right" as const,
      render:(r: ProductCategory) => (
        <span style={{ fontWeight:600 }}>{r.product_count ?? 0}</span>
      ),
    },
    {
      key:"actions", header:"",
      render:(r: ProductCategory) => (
        <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }} onClick={e => e.stopPropagation()}>
          <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button
            type="button" size="sm" variant="danger"
            onClick={() => handleDelete(r)}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kategori Produk"
        subtitle="Pengelompokan produk berdasarkan kategori"
        actions={
          <Button type="button" onClick={openCreate}>
            + Tambah Kategori
          </Button>
        }
      />

      <Card style={{ padding:0 }}>
        <Table
          columns={columns}
          data={cats as ProductCategory[]}
          rowKey={r => r.id}
          loading={isLoading}
          emptyMessage="Belum ada kategori. Mulai dengan menambahkan kategori pertama."
        />
      </Card>

      <CatModal open={modal.open} onClose={closeModal} editing={modal.editing} />
    </div>
  );
}
