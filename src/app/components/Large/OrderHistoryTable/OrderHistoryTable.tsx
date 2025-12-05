"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { IoChevronBack, IoChevronForward, IoClose } from "react-icons/io5";
import {
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaGift,
  FaCreditCard,
  FaTrash,
} from "react-icons/fa";

import styles from "./orderHistoryTable.module.css";

interface TransactionDetails {
  address?: string;
  notes?: string;
  weight?: number;
  code?: string;
  vendor?: string;
  image?: string;
  method?: string;
  inv_id?: number;
}

export interface UnifiedTransaction {
  ref_id: number;
  category: "PICKUP" | "REDEEM" | "PAYMENT";
  title: string;
  date: string;
  status: string;
  amount_display: string;
  details: TransactionDetails;
}

export default function OrderHistoryTable() {
  const { data: session } = useSession();
  const router = useRouter();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [tableData, setTableData] = useState<UnifiedTransaction[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UnifiedTransaction | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactionData = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/order-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await response.json();

      if (result && Array.isArray(result.data)) {
        const cleanData: UnifiedTransaction[] = result.data.map(
          (item: any) => ({
            ...item,
            details:
              typeof item.details === "string"
                ? JSON.parse(item.details)
                : item.details,
            amount_display: String(item.amount_display),
          })
        );
        setTableData(cleanData);
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && !hasFetchedRef.current) {
      fetchTransactionData();
      hasFetchedRef.current = true;
    }
  }, [session?.user?.id]);

  const columns = useMemo<ColumnDef<UnifiedTransaction>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Transaksi",
        cell: ({ row }) => {
          const data = row.original;
          const dateObj = new Date(data.date);
          const formattedDate = dateObj.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          let Icon = FaTrash;
          let bgColor = "#2f5e44";

          if (data.category === "PICKUP") {
            Icon = FaTruck;
            bgColor = "#11998e";
          } else if (data.category === "REDEEM") {
            Icon = FaGift;
            bgColor = "#f5576c";
          } else if (data.category === "PAYMENT") {
            Icon = FaCreditCard;
            bgColor = "#fda085";
          }

          return (
            <div className={styles.historyCell}>
              <div
                className={styles.historyIconBg}
                style={{ backgroundColor: bgColor, color: "white" }}
              >
                <Icon size={20} />
              </div>
              <div className={styles.historyText}>
                <span className={styles.historyTitle}>{data.title}</span>
                <span className={styles.historyDate}>{formattedDate}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "amount_display",
        header: "Nominal / Poin",
        cell: (info) => {
          const val = info.getValue() as string;
          const isNegative = val.startsWith("-");

          return (
            <span
              className={styles.weightCell}
              style={{ color: isNegative ? "#ed1c24" : "#2f5e44" }}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const isSuccess = /berhasil|paid|selesai/i.test(status);
          const isPending = /pending|proses/i.test(status);

          // GABUNG CLASS PAKE TEMPLATE LITERALS
          let badgeClass = styles.badgeFailed;
          let Icon = FaTimesCircle;

          if (isSuccess) {
            badgeClass = styles.badgeSuccess;
            Icon = FaCheckCircle;
          } else if (isPending) {
            badgeClass = styles.badgePending;
            Icon = FaCalendar;
          }

          return (
            <span className={`${styles.statusBadge} ${badgeClass}`}>
              <Icon size={14} />
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Detail",
        cell: ({ row }) => (
          <button
            className={styles.detailBtn}
            onClick={() => {
              setSelectedOrder(row.original);
              setIsModalOpen(true);
            }}
          >
            Lihat
          </button>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    let filtered = [...tableData];
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "berhasil")
          return /berhasil|paid/i.test(item.status);
        if (statusFilter === "pending")
          return /pending|proses/i.test(item.status);
        if (statusFilter === "gagal") return /gagal|failed/i.test(item.status);
        return true;
      });
    }
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        const diffTime = now.getTime() - itemDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        switch (dateFilter) {
          case "7days":
            return diffDays <= 7;
          case "30days":
            return diffDays <= 30;
          case "90days":
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }
    return filtered;
  }, [categoryFilter, statusFilter, dateFilter, tableData]);

  const table = useReactTable({
    data: filteredData,
    columns,
    initialState: {
      pagination: { pageSize: 5 },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timePart = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${datePart}, ${timePart}`;
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.cardContainer}>
        <div className={styles.headerSection}>
          <h2>Riwayat Transaksi</h2>
          <p>
            Semua riwayat Pickup, Redeem Rewards, dan Pembayaran kamu ada di
            sini.
          </p>
        </div>

        <div className={styles.filterButtonsRow}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterChip}
          >
            <option value="ALL">Semua Kategori</option>
            <option value="PICKUP">Pickup Sampah</option>
            <option value="REDEEM">Redeem Reward</option>
            <option value="PAYMENT">Pembayaran</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.filterChip}
          >
            <option value="all">Semua Tanggal</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterChip}
          >
            <option value="all">Semua Status</option>
            <option value="berhasil">Berhasil</option>
            <option value="pending">Pending</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <p className={styles.emptyState}>Loading data...</p>
          ) : (
            <table className={styles.customTable}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {table.getRowModel().rows.length === 0 && !isLoading && (
            <p className={styles.emptyState}>Tidak ada data yang tersedia.</p>
          )}
        </div>

        {table.getRowModel().rows.length > 0 && (
          <div className={styles.paginationContainer}>
            <span className={styles.paginationInfo}>
              Halaman{" "}
              <strong>{table.getState().pagination.pageIndex + 1}</strong> dari{" "}
              <strong>{table.getPageCount()}</strong>
            </span>
            <div className={styles.paginationButtons}>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className={styles.pageBtn}
              >
                <IoChevronBack size={16} /> Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className={styles.pageBtn}
              >
                Next <IoChevronForward size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Detail Transaksi #{selectedOrder.ref_id}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.btnClose}
              >
                <IoClose />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Badge */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <span
                  className={`${styles.statusBadge} ${
                    /berhasil|paid|selesai/i.test(selectedOrder.status)
                      ? styles.badgeSuccess
                      : /pending|proses/i.test(selectedOrder.status)
                      ? styles.badgePending
                      : styles.badgeFailed
                  }`}
                >
                  {/berhasil|paid|selesai/i.test(selectedOrder.status) ? (
                    <FaCheckCircle />
                  ) : /pending|proses/i.test(selectedOrder.status) ? (
                    <FaCalendar />
                  ) : (
                    <FaTimesCircle />
                  )}
                  {selectedOrder.status}
                </span>
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <label>Jenis Transaksi</label>
                    <div className={styles.value}>{selectedOrder.title}</div>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Waktu Transaksi</label>
                    <div className={styles.value}>
                      {formatDateTime(selectedOrder.date)}
                    </div>
                  </div>
                </div>

                <div className={`${styles.infoRow} ${styles.mt3}`}>
                  {selectedOrder.category === "PICKUP" && (
                    <div className={`${styles.infoItem} ${styles.fullWidth}`}>
                      <label>Alamat Penjemputan</label>
                      <div className={styles.value}>
                        {selectedOrder.details.address}
                      </div>
                      <label className={styles.mt2}>Catatan</label>
                      <div className={styles.value}>
                        {selectedOrder.details.notes || "-"}
                      </div>
                    </div>
                  )}

                  {selectedOrder.category === "REDEEM" && (
                    <>
                      <div className={styles.infoItem}>
                        <label>Vendor</label>
                        <div className={styles.value}>
                          {selectedOrder.details.vendor}
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Kode Transaksi</label>
                        <div
                          className={styles.value}
                          style={{
                            fontFamily: "monospace",
                            letterSpacing: "1px",
                          }}
                        >
                          {selectedOrder.details.code}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedOrder.category === "PAYMENT" && (
                    <>
                      <div className={styles.infoItem}>
                        <label>Metode Pembayaran</label>
                        <div className={styles.value}>
                          {selectedOrder.details.method}
                        </div>
                      </div>
                      <div className={styles.infoItem}>
                        <label>Invoice ID</label>
                        <div className={styles.value}>
                          #{selectedOrder.details.inv_id}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.footerTotal}>
                <div>
                  <div className={styles.labelLight}>Total Nominal</div>
                  <div className={styles.valueLarge}>
                    {selectedOrder.category === "PICKUP"
                      ? "Poin Didapat"
                      : selectedOrder.category === "REDEEM"
                      ? "Poin Ditukar"
                      : "Total Bayar"}
                  </div>
                </div>
                <div className={styles.textRight}>
                  <div className={styles.labelLight}>Total</div>
                  <div className={styles.valueLarge}>
                    {selectedOrder.amount_display}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
