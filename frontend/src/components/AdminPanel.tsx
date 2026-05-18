"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import AuthGuard from "@/components/AuthGuard";
import {
  createBranch,
  createHall,
  createTable,
  deleteBranch,
  deleteHall,
  deleteTable,
  fetchAdminBranches,
  fetchAdminHalls,
  fetchAdminTables,
  fetchAllBookings,
  getErrorMessage,
  updateBookingStatus,
} from "@/lib/api";
import type { Branch, DiningTable, Hall, Reservation, ReservationStatus } from "@/types";
import StatusSelect from "@/components/StatusSelect";
import { nextTablePosition, TABLE_STATUS_LABELS } from "@/lib/tableLayout";

type Tab = "bookings" | "branches" | "halls" | "tables";

function AdminPanelContent() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);

  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "" });
  const [hallForm, setHallForm] = useState({ name: "", description: "" });
  const [tableForm, setTableForm] = useState({
    tableNumber: 1,
    capacity: 4,
    status: "AVAILABLE",
    shape: "circle",
  });

  const refreshBookings = () => fetchAllBookings().then(setBookings).catch((e) => setError(getErrorMessage(e)));
  const refreshBranches = () =>
    fetchAdminBranches()
      .then((b) => {
        setBranches(b);
        if (b.length && selectedBranchId === null) setSelectedBranchId(b[0].id);
      })
      .catch((e) => setError(getErrorMessage(e)));

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshBranches(), refreshBookings()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBranchId) {
      setHalls([]);
      return;
    }
    fetchAdminHalls(selectedBranchId)
      .then((h) => {
        setHalls(h);
        if (h.length && !h.some((x) => x.id === selectedHallId)) setSelectedHallId(h[0].id);
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [selectedBranchId]);

  useEffect(() => {
    if (!selectedHallId) {
      setTables([]);
      return;
    }
    fetchAdminTables(selectedHallId).then(setTables).catch((e) => setError(getErrorMessage(e)));
  }, [selectedHallId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "bookings", label: "Брони" },
    { id: "branches", label: "Филиалы" },
    { id: "halls", label: "Залы" },
    { id: "tables", label: "Столики" },
  ];

  if (loading && !branches.length) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4b5a0] border-t-[#8b7355]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-semibold">Админ-панель</h1>
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f5f1eb] p-1 sm:grid-cols-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={tab === t.id ? "tab tab-active" : "tab"}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">#{b.id} · {b.username}</p>
                <p className="text-[#8a847a]">
                  {b.branchName} · {b.hallName} · стол {b.tableNumber}
                </p>
                <p className="text-[#8a847a]">{format(parseISO(b.reservationTime), "dd.MM.yyyy HH:mm")}</p>
              </div>
              <StatusSelect
                value={b.status}
                onChange={async (status) => {
                  await updateBookingStatus(b.id, status);
                  refreshBookings();
                }}
              />
            </div>
          ))}
        </div>
      )}

      {tab === "branches" && (
        <div className="space-y-4">
          <form
            className="card space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              await createBranch(branchForm);
              setBranchForm({ name: "", address: "", phone: "" });
              refreshBranches();
            }}
          >
            <p className="font-medium">Добавить филиал</p>
            <input className="input-field" placeholder="Название" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required />
            <input className="input-field" placeholder="Адрес" value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
            <input className="input-field" placeholder="Телефон" value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} />
            <button type="submit" className="btn-primary">Сохранить</button>
          </form>
          <ul className="space-y-2">
            {branches.map((b) => (
              <li key={b.id} className="card flex justify-between gap-2">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-[#8a847a]">{b.address}</p>
                </div>
                <button type="button" className="btn-danger" onClick={async () => { if (confirm("Удалить филиал?")) { await deleteBranch(b.id); refreshBranches(); } }}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "halls" && (
        <div className="space-y-4">
          <select
            className="input-field"
            value={selectedBranchId ?? ""}
            onChange={(e) => {
              setSelectedBranchId(Number(e.target.value));
              setSelectedHallId(null);
            }}
          >
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {selectedBranchId && (
            <form
              className="card space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await createHall(selectedBranchId, hallForm);
                setHallForm({ name: "", description: "" });
                fetchAdminHalls(selectedBranchId).then(setHalls);
              }}
            >
              <p className="font-medium">Добавить зал</p>
              <input className="input-field" placeholder="Название зала" value={hallForm.name} onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })} required />
              <input className="input-field" placeholder="Описание" value={hallForm.description} onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })} />
              <button type="submit" className="btn-primary">Сохранить</button>
            </form>
          )}
          <ul className="space-y-2">
            {halls.map((h) => (
              <li key={h.id} className="card flex justify-between">
                <span className="font-medium">{h.name}</span>
                <button type="button" className="btn-danger" onClick={async () => { if (confirm("Удалить зал?")) { await deleteHall(h.id); if (selectedBranchId) fetchAdminHalls(selectedBranchId).then(setHalls); } }}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "tables" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <select className="input-field" value={selectedBranchId ?? ""} onChange={(e) => { setSelectedBranchId(Number(e.target.value)); setSelectedHallId(null); }}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="input-field" value={selectedHallId ?? ""} onChange={(e) => setSelectedHallId(Number(e.target.value))}>
              {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          {selectedHallId && (
            <form
              className="card space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const pos = nextTablePosition(tables.length);
                await createTable(selectedHallId, { ...tableForm, ...pos });
                setTableForm({
                  tableNumber: tableForm.tableNumber + 1,
                  capacity: 4,
                  status: "AVAILABLE",
                  shape: "circle",
                });
                if (selectedHallId) fetchAdminTables(selectedHallId).then(setTables);
              }}
            >
              <p className="font-medium">Добавить столик</p>
              <p className="text-xs text-[#8a847a]">Размер на схеме зависит от числа мест</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">№ стола</span>
                  <input
                    type="number"
                    min={1}
                    className="input-field"
                    value={tableForm.tableNumber}
                    onChange={(e) => setTableForm({ ...tableForm, tableNumber: Number(e.target.value) })}
                    required
                  />
                </label>
                <label className="block">
                  <span className="label">Мест</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="input-field"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                    required
                  />
                </label>
                <label className="block">
                  <span className="label">Статус</span>
                  <select
                    className="input-field"
                    value={tableForm.status}
                    onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })}
                  >
                    <option value="AVAILABLE">{TABLE_STATUS_LABELS.AVAILABLE}</option>
                    <option value="MAINTENANCE">{TABLE_STATUS_LABELS.MAINTENANCE}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label">Форма</span>
                  <select
                    className="input-field"
                    value={tableForm.shape}
                    onChange={(e) => setTableForm({ ...tableForm, shape: e.target.value })}
                  >
                    <option value="circle">Круг</option>
                    <option value="rect">Прямоугольник</option>
                  </select>
                </label>
              </div>
              <button type="submit" className="btn-primary">Добавить стол</button>
            </form>
          )}
          <ul className="space-y-2">
            {tables.map((t) => (
              <li key={t.id} className="card flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 font-medium">
                  №{t.tableNumber} · {t.capacity} {t.capacity === 1 ? "место" : t.capacity < 5 ? "места" : "мест"}
                  <span className="ml-2 text-[#8a847a]">
                    · {t.shape === "rect" ? "прямоугольник" : "круг"} · {TABLE_STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </span>
                <button type="button" className="btn-danger" onClick={async () => { if (confirm("Удалить стол?")) { await deleteTable(t.id); if (selectedHallId) fetchAdminTables(selectedHallId).then(setTables); } }}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AuthGuard requireAdmin>
      <AdminPanelContent />
    </AuthGuard>
  );
}
