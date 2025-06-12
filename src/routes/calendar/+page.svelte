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
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
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
          if (time?.trim()) {
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
            color: 'var(--primary-color)'
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

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  :root {
    --bg-color: hsla(30.73, 22.65%, 64.51%, 1);
    --text-color: #1e1e1e;
    --primary-color: #4a4a4a;
    --secondary-color: #d4bfae;
    --card-bg: #fafafa;
    --editor-bg: #ffffff;
    --border-color: #ccc;
    --hover-color: #e0e0e0;
    --accent-color: #5c6bc0;
  }

  nav {
    background-color: var(--bg-color);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text-color);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    align-items: center;
  }

  .nav-links a {
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.2s;
    padding: 0.5rem 0;
    border-bottom: 2px solid transparent;
  }

  .nav-links a:hover {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .nav-links a.active {
    color: var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
  }

  .page-wrapper {
    padding: 2rem 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .subtext {
    font-size: 1rem;
    color: #555;
    margin-bottom: 2rem;
  }

  .calendar-container {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 1rem;
    height: 80vh;
  }

  #calendar {
    width: 100%;
    height: 100%;
  }

  :global(.fc) {
    font-size: 0.9rem;
  }

  :global(.fc .fc-toolbar-title) {
    font-weight: 600;
    font-size: 1.5rem;
  }

  :global(.fc .fc-col-header-cell-cushion) {
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
  }

  :global(.fc .fc-daygrid-day-number) {
    font-weight: 500;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
    display: block;
  }

  :global(.fc .fc-event) {
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.85rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    animation: fadeIn 0.2s ease-in-out;
  }

  :global(.fc .fc-day-today) {
    background: rgba(92, 107, 192, 0.08);
    border: 2px solid var(--accent-color);
    box-shadow: 0 0 5px rgba(92, 107, 192, 0.3);
  }

  :global(.fc .fc-daygrid-day:hover) {
    background: rgba(92, 107, 192, 0.05);
    cursor: pointer;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }
</style>

<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <a href="/calendar" class="active">Calendar</a>
    <a href="/agent">Agent</a>
    <a href="/notebooks">Notebooks</a>
  </div>
</nav>

<div class="page-wrapper">
  <h1>Calendar</h1>
  <p class="subtext">Click a date to quickly add an event. View by month, week, or day.</p>
  <div class="calendar-container">
    <div id="calendar"></div>
  </div>
</div>



