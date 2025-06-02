<!-- src/routes/calendar/+page.svelte -->
 <!-- testing calendar -->

<script lang="ts">
  import '../../app.css'; 
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';

  let calendar: Calendar | null = null;

  onMount(() => {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
      calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        selectable: true,
        headerToolbar: {
          left:   'prev',
          center: 'title',
          right:  'next'
        },

        eventTimeFormat: {
          hour: 'numeric',      
          minute: '2-digit',    
          meridiem: 'short'     
        },

        events: [],

        dateClick: (info) => {
          
          const title = prompt('Enter event title:');
          if (!title || !calendar) return;
          
          const time = prompt('Enter time (24 hour):');
          const description = prompt('Enter description:');

          let isoStart = info.dateStr;
          let allDayFlag = true;
          if (time && time.trim()) {
            const t = time.trim();
            const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (hhmmRegex.test(t)) {
              isoStart += 'T' + t;
              allDayFlag = false;
            } else {
              alert('Invalid time format, creating as all-day event.');
            }
          }

          calendar.addEvent({
            title: title.trim(),
            start: isoStart,
            allDay: allDayFlag,
            extendedProps: {
              description: description?.trim() || ''
            },
            color: 'black'
          });
        },

        eventClick: (clickInfo) => {
          
          const ev = clickInfo.event;
          const desc = (ev.extendedProps as any).description || '(no description)';
          alert(`${ev.title}\nStarts: ${ev.start?.toLocaleString()}\n\n${desc}`);
        }
      });

      calendar.render();
    }
  });
</script>

<div id="calendar"></div>

<style>
  /* ————— Global Resets & Calendar Styles ————— */

  :global(html, body) {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Helvetica Neue', sans-serif;
    background: hsla(30.73, 22.65%, 64.51%, 1);
    color: #1e1e1e;
  }

  #calendar {
    height: 100%;
    width: 100%;
  }

  :global(.fc .fc-toolbar) {
    display: flex;
    align-items: center;
    position: relative;
    padding: 0.5rem 0;
  }

  :global(.fc .fc-toolbar-chunk-left) {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  :global(.fc .fc-toolbar-chunk-center) {
    flex: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }

  :global(.fc .fc-toolbar-chunk-right) {
    flex: 1;
    display: flex;
    justify-content: flex-end;
  }

  :global(.fc .fc-toolbar-title) {
    font-size: 1.8rem;
    font-weight: bold;
    color: #1e1e1e;
    text-align: center;
    margin: 0;
    line-height: 1;
  }

  :global(.fc .fc-button.fc-prev-button),
  :global(.fc .fc-button.fc-next-button) {
    background: #1e1e1e;
    color: #d4bfae;
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }

  :global(.fc .fc-button.fc-prev-button:hover),
  :global(.fc .fc-button.fc-next-button:hover) {
    background: #333;
  }

  :global(.fc a) {
    text-decoration: none;
  }

  :global(.fc .fc-col-header-cell-cushion) {
    color: #1e1e1e;
    font-weight: 500;
    text-decoration: none;
  }

  :global(.fc .fc-daygrid-day-number) {
    color: #1e1e1e;
    font-weight: 500;
    padding: 4px;
    text-decoration: none;
  }

  :global(.fc-theme-standard .fc-scrollgrid) {
    border: none; 
  }
  :global(.fc-theme-standard td),
  :global(.fc-theme-standard th) {
    border: 1px solid rgba(0,0,0,0.1);
  }

  :global(.fc .fc-daygrid-day) {
    background: transparent;
    transition: background-color 0.2s ease;
  }
  :global(.fc .fc-daygrid-day:hover) {
    background: rgba(0,0,0,0.05);
    cursor: pointer;
  }

  :global(.fc .fc-day-today) {
    background: rgba(0,0,0,0.08);
    border-radius: 4px;
  }
  
  :global(.fc .fc-event-time) {
    color: #1e1e1e !important;
  }
  
  :global(.fc .fc-event-title) {
    color: #1e1e1e !important;
  }
  
  :global(.fc .fc-event-title a) {
    text-decoration: none !important;
  }

  :global(.fc .fc-event-dot) {
    background-color: #1e1e1e !important;
  }
</style>
