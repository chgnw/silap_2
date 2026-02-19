import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { MdCancel } from "react-icons/md";

import { showToast } from "@/lib/toastHelper";
import styles from './calendar.module.css';

export default function Calendar({ refreshTrigger }: { refreshTrigger: number }) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState<'list' | 'edit' | 'delete'>('list');
  const [selectedDate, setSelectedDate] = useState('');
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    user_name: '',
    address: '',
    weight: '',
    date: '',
    time: ''
  });

  /* 
    Fetch data untuk event-event yang ada untuk si user 
  */
  const fetchEvents = async (user_id: string) => {
    try {
      const response = await fetch('/api/dashboard/pickup/get-events', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id
        })
      })

      if (!response.ok) {
        throw new Error('Gagal mengambil data event')
      }

      const data = await response.json();

      const formattedEvents = data.data.map((item: any) => {
        const dateOnly = new Date(item.event_date).toLocaleDateString('en-CA', {
          timeZone: 'Asia/Jakarta'
        });
        const timeOnly = item.pickup_time;
        const commonProps = {
          ...item
        };

        if (item.pickup_type_id === 2) {
          const dayIndex = new Date(dateOnly).getDay();
          return {
            id: item.id,
            groupId: `${item.id}`,
            title: `Rutin: ${timeOnly.slice(0, 5)}`,
            daysOfWeek: [dayIndex],
            startTime: timeOnly,
            startRecur: dateOnly,
            extendedProps: commonProps
          };
        } else {
          return {
            id: item.id,
            title: `Pick Up: ${timeOnly.slice(0, 5)}`,
            start: `${dateOnly}T${timeOnly}`,
            extendedProps: commonProps
          };
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchEvents(session?.user?.id);
    }
  }, [refreshTrigger]);

  /*
    Function untuk munculin modal edit/delete event
  */
  const handleDateClick = (info: any) => {
    const clickedDateStr = info.dateStr;
    const clickedDateObj = new Date(clickedDateStr);
    const clickedDayIndex = clickedDateObj.getDay();

    const eventsFound = events.filter((ev) => {
      if (ev.start && ev.start.startsWith(clickedDateStr)) return true;
      if (ev.daysOfWeek) {
        const isDayMatch = ev.daysOfWeek.includes(clickedDayIndex);
        const isAfterStart = ev.startRecur ? clickedDateStr >= ev.startRecur : true;
        return isDayMatch && isAfterStart;
      }
      return false;
    });

    setSelectedDate(clickedDateStr);
    setEventsOnSelectedDate(eventsFound);

    setModalView('list');
    setEditingEvent(null);
    setShowModal(true);
  }

  /*
    Function untuk update tanggal si event kalau dipindahin
  */
  const updateEventDate = async (eventId: string, newDate: string) => {
    try {
      const formattedDate = new Date(newDate).toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta'
      });

      const response = await fetch("/api/dashboard/pickup/update-event-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          user_id: session?.user?.id,
          new_date: formattedDate
        })
      });

      const result = await response.json();
      if (result.message !== "SUCCESS") {
        showToast(result.message, "Failed to update event");
      }

      showToast(result.message, result.detail);
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleEventDrop = (info: any) => {
    if (info.event.extendedProps.pickup_type_id === 2) {
      showToast("error", "Event rutin tidak bisa dipindah via drag & drop (edit manual).");
      info.revert();
      return;
    }
    const eventId = info.event.id;
    const newDate = info.event.start;
    updateEventDate(eventId, newDate);
  }

  const handleEditAction = (eventData: any) => {
    setEditingEvent(eventData);

    const currentEventDate = eventData.start ? eventData.start.split('T')[0] : selectedDate;
    setFormData({
      user_id: eventData.extendedProps.user_id,
      user_name: `${eventData.extendedProps.first_name} ${eventData.extendedProps.last_name}`,
      address: eventData.extendedProps.pickup_address || '',
      weight: eventData.extendedProps.pickup_weight,
      date: currentEventDate,
      time: eventData.extendedProps.pickup_time || '00:00'
    });

    setModalView('edit');
  }

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch("/api/dashboard/pickup/update-event-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: editingEvent.id,
          user_id: session?.user?.id,
          new_address: formData.address,
          new_date: formData.date,
          new_time: formData.time
        })
      });

      const result = await response.json();
      if (result.message === "SUCCESS") {
        showToast("success", "Data berhasil diperbarui");
        if (session?.user?.id) {
          fetchEvents(session?.user?.id);
        }
        setShowModal(false);
      } else {
        showToast("error", result.detail || "Gagal update");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Terjadi kesalahan sistem");
    }
  }

  const handleDeleteAction = (eventData: any) => {
    setEditingEvent(eventData);
    setModalView('delete');
  }

  const confirmDelete = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch("/api/dashboard/pickup/delete-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: editingEvent.id,
          user_id: session?.user?.id
        })
      });

      const result = await response.json();
      if (result.message === "SUCCESS") {
        showToast("success", "Event berhasil dihapus");
        if (session?.user?.id) {
          fetchEvents(session?.user?.id);
        }

        setEventsOnSelectedDate(prev => prev.filter(e => e.id !== editingEvent.id));

        if (eventsOnSelectedDate.length <= 1) {
          setShowModal(false);
        }
      } else {
        showToast("error", "Gagal menghapus event");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setModalView('list');
      setEditingEvent(null);
    }
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        editable={true}
        eventDrop={handleEventDrop}
      />

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              {modalView === 'list' ? (
                <h3>Events on {selectedDate}</h3>
              ) : modalView === 'edit' ? (
                <h3>Edit Event</h3>
              ) : (
                <h3>Konfirmasi Hapus Event</h3>
              )}
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                <MdCancel />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* 
                list = tampilin semua event pada hari itu 
                cuma nampilin list event-event apa aja yang ada di hari itu
                dan atas nama user tersebut
              */}
              {modalView === 'list' && (
                <>
                  {eventsOnSelectedDate.length > 0 ? (
                    <ul className={styles.eventList}>
                      {eventsOnSelectedDate.map((ev) => (
                        <li key={ev.id} className={styles.eventItem}>
                          <div className={styles.eventInfo}>
                            <strong>{ev.extendedProps.pickup_time.slice(0, 5)} ({ev.extendedProps.pickup_type_name})</strong>
                            <span className={styles.eventSub}>
                              {ev.extendedProps.pickup_address || "Tidak ada alamat"}
                            </span>
                          </div>
                          <div className={styles.eventActions}>
                            <button onClick={() => handleEditAction(ev)} className={`${styles.btnEdit} ${styles.btn}`}>Edit</button>
                            <button onClick={() => handleDeleteAction(ev)} className={`${styles.btnDelete} ${styles.btn}`}>Del</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.emptyState}>Tidak ada event.</p>
                  )}
                </>
              )}

              {/*  
                edit = ubah data event
                berarti modalnya itu nampilin form
              */}
              {modalView === 'edit' && (
                <div className={styles.formContainer}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Nama</label>
                      <input
                        type="text"
                        value={formData.user_name}
                        className={styles.inputField}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Berat</label>
                      <input
                        type="text"
                        value={`${formData.weight} kg`}
                        className={styles.inputField}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Alamat</label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={styles.inputField}
                      placeholder="Masukkan alamat lengkap..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tanggal Pick Up</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Waktu Pick Up</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button onClick={() => setModalView('list')} className={`${styles.btnCancel} ${styles.btn}`}>
                      Batal
                    </button>
                    <button onClick={handleSaveEdit} className={`${styles.btnSave} ${styles.btn}`}>
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Confirmation View */}
              {modalView === 'delete' && editingEvent && (
                <div className={styles.deleteConfirmation}>
                  <p className={styles.deleteWarning}>Apakah Anda yakin ingin menghapus event berikut?</p>
                  <div className={styles.eventDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Nama Customer:</span>
                      <span className={styles.detailValue}>
                        {editingEvent.extendedProps.first_name} {editingEvent.extendedProps.last_name}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Tipe Pickup:</span>
                      <span className={styles.detailValue}>{editingEvent.extendedProps.pickup_type_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Tanggal:</span>
                      <span className={styles.detailValue}>{selectedDate}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Jam:</span>
                      <span className={styles.detailValue}>{editingEvent.extendedProps.pickup_time.slice(0, 5)}</span>
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button
                      onClick={() => setModalView('list')}
                      className={`${styles.btnCancel} ${styles.btn}`}
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmDelete}
                      className={`${styles.btnDelete} ${styles.btn}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
