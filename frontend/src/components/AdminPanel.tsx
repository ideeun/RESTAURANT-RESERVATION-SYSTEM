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
import { applyReservationEvent, subscribeAdminBookings, subscribeHallAvailability } from "@/lib/realtime";
import type { Branch, DiningTable, Hall, Reservation, ReservationStatus } from "@/types";
import Select from "@/components/Select";
import StatusSelect from "@/components/StatusSelect";
import FloorPlanEditor from "@/components/floor/FloorPlanEditor";
import MenuAdminSection from "@/components/MenuAdminSection";
import AdminConfirmModal from "@/components/AdminConfirmModal";
import NumericInput from "@/components/NumericInput";
import { nextTablePosition, TABLE_STATUS_LABELS } from "@/lib/tableLayout";

function bookingCountForBranch(bookings: Reservation[], branchId: number) {
  return bookings.filter((x) => x.branchId === branchId).length;
}

function bookingCountForHall(bookings: Reservation[], hallId: number) {
  return bookings.filter((x) => x.hallId === hallId).length;
}

function bookingCountForTable(bookings: Reservation[], tableId: number) {
  return bookings.filter((x) => x.tableId === tableId).length;
}

type Tab = "bookings" | "branches" | "halls" | "tables" | "menu";

type AdminDeleteModal =
  | null
  | {
      title: string;
      message: string;
      variant: "confirm" | "alert";
      danger?: boolean;
      confirmLabel?: string;
      onConfirm?: () => void | Promise<void>;
    };

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

  const [deleteModal, setDeleteModal] = useState<AdminDeleteModal>(null);

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
    return subscribeAdminBookings((event) => {
      setBookings((prev) => applyReservationEvent(prev, event));
    });
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
    fetchAdminTables(selectedHallId)
      .then((list) => {
        setTables(list);
        const next =
          (list.length ? Math.max(...list.map((t) => t.tableNumber)) : 0) + 1;
        setTableForm((f) => ({ ...f, tableNumber: next }));
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [selectedHallId]);

  useEffect(() => {
    if (tab !== "tables" || !selectedHallId) return;
    return subscribeHallAvailability(selectedHallId, () => {
      fetchAdminTables(selectedHallId).then(setTables).catch((e) => setError(getErrorMessage(e)));
    });
  }, [tab, selectedHallId]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "bookings", label: "Брони" },
    { id: "branches", label: "Филиалы" },
    { id: "halls", label: "Залы" },
    { id: "tables", label: "Столики" },
    { id: "menu", label: "Меню" },
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
      <AdminConfirmModal
        open={deleteModal !== null}
        title={deleteModal?.title ?? ""}
        message={deleteModal?.message ?? ""}
        variant={deleteModal?.variant ?? "alert"}
        danger={deleteModal?.danger}
        confirmLabel={deleteModal?.confirmLabel}
        onClose={() => setDeleteModal(null)}
        onConfirm={deleteModal?.onConfirm}
      />

      <h1 className="text-2xl font-semibold">Админ-панель</h1>
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f5f1eb] p-1 sm:grid-cols-3 lg:grid-cols-5">
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
                  {b.branchId != null ? `Филиал №${b.branchId} · ` : ""}{b.branchName}
                  {" · "}
                  {b.hallId != null ? `Зал №${b.hallId} · ` : ""}{b.hallName}
                  {" · "}стол {b.tableNumber}
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
                  <p className="font-medium">
                    <span className="text-[#8b7355]">№{b.id}</span> · {b.name}
                  </p>
                  <p className="text-xs text-[#8a847a]">{b.address}</p>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={async () => {
                    const nBook = bookingCountForBranch(bookings, b.id);
                    if (nBook > 0) {
                      setDeleteModal({
                        variant: "alert",
                        title: "Удаление невозможно",
                        message: `Нельзя удалить филиал «${b.name}»: есть ${nBook} бронирований. Отмените или завершите их во вкладке «Брони», затем повторите удаление.`,
                      });
                      return;
                    }
                    let branchHalls: Hall[];
                    try {
                      setError(null);
                      branchHalls = await fetchAdminHalls(b.id);
                    } catch (e) {
                      setError(getErrorMessage(e));
                      return;
                    }
                    const hasChildren = branchHalls.length > 0;
                    setDeleteModal({
                      variant: "confirm",
                      danger: true,
                      title: hasChildren ? "Удалить филиал со всеми залами?" : "Удалить филиал?",
                      message: hasChildren
                        ? `У филиала «${b.name}» ${branchHalls.length} зал(ов). Все залы и столы будут удалены безвозвратно.`
                        : `Филиал «${b.name}» будет удалён безвозвратно.`,
                      confirmLabel: "Удалить",
                      onConfirm: async () => {
                        try {
                          setError(null);
                          await deleteBranch(b.id);
                          await refreshBranches();
                        } catch (e) {
                          setError(getErrorMessage(e));
                        }
                      },
                    });
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "halls" && (
        <div className="space-y-4">
          <Select
            value={selectedBranchId ?? ""}
            onChange={(id) => {
              setSelectedBranchId(id);
              setSelectedHallId(null);
            }}
            options={branches.map((b) => ({ value: b.id, label: `№${b.id} · ${b.name}` }))}
            placeholder="Филиал"
          />
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
                <span className="font-medium">
                  <span className="text-[#8b7355]">№{h.id}</span> · {h.name}
                </span>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={async () => {
                    const nBook = bookingCountForHall(bookings, h.id);
                    if (nBook > 0) {
                      setDeleteModal({
                        variant: "alert",
                        title: "Удаление невозможно",
                        message: `Нельзя удалить зал «${h.name}»: есть ${nBook} бронирований. Отмените или завершите их во вкладке «Брони», затем повторите удаление.`,
                      });
                      return;
                    }
                    let hallTables: DiningTable[];
                    try {
                      setError(null);
                      hallTables = selectedHallId === h.id ? tables : await fetchAdminTables(h.id);
                    } catch (e) {
                      setError(getErrorMessage(e));
                      return;
                    }
                    const hasTables = hallTables.length > 0;
                    setDeleteModal({
                      variant: "confirm",
                      danger: true,
                      title: hasTables ? "Удалить зал со всеми столами?" : "Удалить зал?",
                      message: hasTables
                        ? `В зале «${h.name}» ${hallTables.length} стол(ов). Они будут удалены безвозвратно.`
                        : `Зал «${h.name}» будет удалён безвозвратно.`,
                      confirmLabel: "Удалить",
                      onConfirm: async () => {
                        try {
                          setError(null);
                          await deleteHall(h.id);
                          if (selectedBranchId) await fetchAdminHalls(selectedBranchId).then(setHalls);
                        } catch (e) {
                          setError(getErrorMessage(e));
                        }
                      },
                    });
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "menu" && <MenuAdminSection />}

      {tab === "tables" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={selectedBranchId ?? ""}
              onChange={(id) => {
                setSelectedBranchId(id);
                setSelectedHallId(null);
              }}
              options={branches.map((b) => ({ value: b.id, label: `№${b.id} · ${b.name}` }))}
              placeholder="Филиал"
            />
            <Select
              value={selectedHallId ?? ""}
              onChange={(id) => setSelectedHallId(id)}
              options={halls.map((h) => ({ value: h.id, label: `№${h.id} · ${h.name}` }))}
              placeholder="Зал"
            />
          </div>
          {selectedHallId && (
            <>
              <FloorPlanEditor
                hallId={selectedHallId}
                tables={tables}
                tableForm={tableForm}
                onTablesChange={() => {
                  fetchAdminTables(selectedHallId).then((list) => {
                    setTables(list);
                    setTableForm((f) => ({
                      ...f,
                      tableNumber: (list.length ? Math.max(...list.map((t) => t.tableNumber)) : 0) + 1,
                    }));
                  });
                }}
              />
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
              <p className="font-medium">Добавить столик (форма)</p>
              <p className="text-xs text-[#8a847a]">
                Или нажмите «Поставить стол» на схеме выше. Размер зависит от числа мест.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">№ стола</span>
                  <NumericInput
                    min={1}
                    value={tableForm.tableNumber}
                    onValueChange={(n) => setTableForm({ ...tableForm, tableNumber: n })}
                  />
                </label>
                <label className="block">
                  <span className="label">Мест</span>
                  <NumericInput
                    min={1}
                    max={20}
                    value={tableForm.capacity}
                    onValueChange={(n) => setTableForm({ ...tableForm, capacity: n })}
                  />
                </label>
                <label className="block">
                  <span className="label">Статус</span>
                  <Select
                    value={tableForm.status}
                    onChange={(status) => setTableForm({ ...tableForm, status })}
                    options={[
                      { value: "AVAILABLE", label: TABLE_STATUS_LABELS.AVAILABLE },
                      { value: "MAINTENANCE", label: TABLE_STATUS_LABELS.MAINTENANCE },
                    ]}
                  />
                </label>
                <label className="block">
                  <span className="label">Форма</span>
                  <Select
                    value={tableForm.shape}
                    onChange={(shape) => setTableForm({ ...tableForm, shape })}
                    options={[
                      { value: "circle", label: "Круг" },
                      { value: "rect", label: "Прямоугольник" },
                    ]}
                  />
                </label>
              </div>
              <button type="submit" className="btn-primary">Добавить стол</button>
            </form>
            </>
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
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    const nBook = bookingCountForTable(bookings, t.id);
                    if (nBook > 0) {
                      setDeleteModal({
                        variant: "alert",
                        title: "Удаление невозможно",
                        message: `Нельзя удалить стол №${t.tableNumber}: есть ${nBook} бронирований. Отмените или завершите их во вкладке «Брони», затем повторите удаление.`,
                      });
                      return;
                    }
                    setDeleteModal({
                      variant: "confirm",
                      danger: true,
                      title: "Удалить стол?",
                      message: `Стол №${t.tableNumber} будет удалён безвозвратно.`,
                      confirmLabel: "Удалить",
                      onConfirm: async () => {
                        try {
                          setError(null);
                          await deleteTable(t.id);
                          if (selectedHallId) fetchAdminTables(selectedHallId).then(setTables);
                        } catch (e) {
                          setError(getErrorMessage(e));
                        }
                      },
                    });
                  }}
                >
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
