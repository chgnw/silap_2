import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import { showToast } from "@/lib/toastHelper"; 

export default function Calendar({ refreshTrigger }: { refreshTrigger: number }) {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);

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
        const dateOnly = item.event_date.split('T')[0];
        const timeOnly = item.pickup_time;
        if (item.pickup_type_id === 2) {
          const dayIndex = new Date(dateOnly).getDay(); 
          return {
            id: item.id,
            groupId: `${item.id}`,
            title: `Rutin: ${timeOnly.slice(0, 5)}`,
            daysOfWeek: [ dayIndex ],
            startTime: timeOnly,
            startRecur: dateOnly,
            extendedProps: { ...item }
          };
        } else {
          return {
            id: item.id,
            title: `Pick Up: ${timeOnly.slice(0, 5)}`,
            start: `${dateOnly}T${timeOnly}`,
            extendedProps: { ...item }
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

  // Ini function kalau misal nanti mau munculin popup untuk edit/delete
  const handleDateClick = (info: any) => {
    console.log('Clicked', info.dateStr)
  }

  /*
    Function untuk update tanggal si event kalau dipindahin
  */
  const updateEventDate = async (eventId: string, newDate: string) => {
    try {
      const response = await fetch("/api/dashboard/pickup/update-event-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          user_id: session?.user?.id,
          new_date: newDate
        })
      });

      const result = await response.json();
      if(result.message !== "SUCCESS") {
        console.error("FAILED");
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleEventDrop = (info: any) => {
    console.log('Event dropped (ID):', info.event.id)
    console.log('New Date:', info.event.start)

    const eventId = info.event.id;
    const newDate = info.event.start;

    updateEventDate(eventId, newDate);
  }

  const handleEventResize = (info: any) => {
    console.log('Event resized', info)
  }

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        editable={true}
        eventDrop={handleEventDrop}
      />
    </div>
  )
}
