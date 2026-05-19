"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createMenuItem,
  deleteMenuItem,
  fetchAdminMenu,
  getErrorMessage,
  menuImageUrl,
  updateMenuItem,
  updateMenuItemImage,
} from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import type { MenuItem } from "@/types";

const CATEGORIES = ["Закуски", "Основные", "Десерты", "Напитки"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0],
  available: true,
  sortOrder: 0,
};

export default function MenuAdminSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [replaceImageId, setReplaceImageId] = useState<number | null>(null);

  const load = useCallback(() => {
    return fetchAdminMenu()
      .then(setItems)
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setPreview(null);
    setEditingId(null);
  };

  const onPickImage = (file: File | null) => {
    setImageFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      category: form.category,
      available: form.available,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, payload);
        if (imageFile) await updateMenuItemImage(editingId, imageFile);
      } else {
        await createMenuItem(payload, imageFile);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category: item.category,
      available: item.available,
      sortOrder: item.sortOrder,
    });
    setImageFile(null);
    setPreview(menuImageUrl(item.imageUrl));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4b5a0] border-t-[#8b7355]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form className="card space-y-3" onSubmit={handleSubmit}>
        <p className="font-medium">{editingId ? "Редактировать блюдо" : "Добавить блюдо"}</p>
        <input
          className="input-field"
          placeholder="Название"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          className="input-field min-h-[72px]"
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label">Цена (сом)</span>
            <input
              type="number"
              min={1}
              step={1}
              className="input-field"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="label">Порядок</span>
            <input
              type="number"
              className="input-field"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="block">
          <span className="label">Категория</span>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
          />
          В меню (доступно гостям)
        </label>
        <label className="block">
          <span className="label">Фото (JPEG, PNG, до 5 МБ)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm"
            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="mt-2 h-28 w-28 rounded-xl object-cover" />
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="card flex gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f0ebe3]">
              {menuImageUrl(item.imageUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={menuImageUrl(item.imageUrl)!}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg">🍽</div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">
                {item.name}{" "}
                {!item.available && <span className="text-xs text-[#8a847a]">(скрыто)</span>}
              </p>
              <p className="text-[#8a847a]">
                {item.category} · {formatPrice(item.price)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => startEdit(item)}>
                  Изменить
                </button>
                <label className="btn-secondary cursor-pointer text-xs">
                  Фото
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setReplaceImageId(item.id);
                      try {
                        await updateMenuItemImage(item.id, f);
                        await load();
                      } catch (err) {
                        setError(getErrorMessage(err));
                      } finally {
                        setReplaceImageId(null);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
                {replaceImageId === item.id && <span className="text-xs text-[#8a847a]">…</span>}
                <button
                  type="button"
                  className="btn-danger text-xs"
                  onClick={async () => {
                    if (!confirm("Удалить блюдо?")) return;
                    await deleteMenuItem(item.id);
                    if (editingId === item.id) resetForm();
                    await load();
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
