<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';

  let calendar: Calendar | null = null;
  let showDialog = false;
  let selectedEvent: any = null;

  function showEventDialog(event: any) {
    selectedEvent = event;
    showDialog = true;
  }

  function closeDialog() {
    showDialog = false;
    selectedEvent = null;
  }

  function deleteEvent() {
    if (selectedEvent) {
      selectedEvent.remove();
      closeDialog();
    }
  }

  function editEvent() {
    if (!selectedEvent) return;

    const currentTitle = selectedEvent.title;
    const currentDesc = (selectedEvent.extendedProps as any).description || '';
    const currentStart = selectedEvent.start!;
    const currentEnd = selectedEvent.end;
    const startTime = selectedEvent.allDay ? '' : currentStart.toTimeString().slice(0, 5);
    const endTime = (currentEnd && !selectedEvent.allDay) ? currentEnd.toTimeString().slice(0, 5) : '';

    const newTitle = prompt('Edit event title:', currentTitle);
    if (newTitle === null) return;

    if (newTitle.trim() === '') {
      alert('Event title cannot be empty.');
      return;
    }

    const newStartTime = prompt("Edit start time (24 hour HH:MM, leave empty for all-day):", startTime);
    const newEndTime = prompt("Edit end time (24 hour HH:MM, leave empty for no end time):", endTime);
    const newDesc = prompt("Edit description:", currentDesc);

    let newStart = new Date(currentStart);
    let newEnd = currentEnd ? new Date(currentEnd) : null;
    let allDay = selectedEvent.allDay;

    const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (newStartTime?.trim()) {
      if (hhmmRegex.test(newStartTime.trim())) {
        const [sh, sm] = newStartTime.trim().split(":").map(Number);
        newStart.setHours(sh);
        newStart.setMinutes(sm);
        allDay = false;

        if (newEndTime?.trim() && hhmmRegex.test(newEndTime.trim())) {
          newEnd = new Date(newStart);
          const [eh, em] = newEndTime.trim().split(":").map(Number);
          newEnd.setHours(eh);
          newEnd.setMinutes(em);

          if (newEnd <= newStart) {
            alert("End time must be after start time.");
            return;
          }
        } else if (newEndTime?.trim() === '') {
          newEnd = null;
        }
      } else {
        alert("Invalid start time format.");
        return;
      }
    } else {
      allDay = true;
      newEnd = null;
    }

    selectedEvent.setProp('title', newTitle.trim());
    selectedEvent.setStart(newStart);
    selectedEvent.setAllDay(allDay);
    if (newEnd) {
      selectedEvent.setEnd(newEnd);
    } else if (!allDay) {
      selectedEvent.setEnd(null);
    }
    selectedEvent.setExtendedProp('description', newDesc?.trim() || '');
    
    closeDialog();
  }

  function formatEventTime(event: any): string {
    if (event.allDay) {
      return 'All Day';
    }
    
    const start = event.start;
    const end = event.end;
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };
    
    if (end) {
      return `${formatTime(start)} - ${formatTime(end)}`;
    } else {
      return formatTime(start);
    }
  }

  function formatEventDate(event: any): string {
    const start = event.start;
    return start.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

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
        displayEventEnd: true,
        eventDisplay: 'block',
        events: [],
        dateClick: (info) => {
          const title = prompt('Enter event title:');
          if (!title || !calendar) return;

          const startTime = prompt('Enter start time (24-hour HH:MM):');
          const description = prompt('Enter description:');

          let isoStart = info.dateStr;
          let isoEnd: string | null = null;
          let allDayFlag = true;

          const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

          if (startTime?.trim()) {
            if (hhmmRegex.test(startTime.trim())) {
              const endTime = prompt('Enter end time (24-hour HH:MM):');

              if (endTime?.trim() && hhmmRegex.test(endTime.trim())) {
                isoStart = `${info.dateStr}T${startTime.trim()}`;
                isoEnd = `${info.dateStr}T${endTime.trim()}`;

                if (isoEnd <= isoStart) {
                  alert('End time must be after start time. Event not created.');
                  return;
                }
                allDayFlag = false;
              } else {
                alert('Invalid or missing end time format. Creating as an all-day event.');
              }
            } else {
              alert('Invalid start time format. Creating as an all-day event.');
            }
          }

          calendar.addEvent({
            title: title.trim(),
            start: isoStart,
            end: isoEnd ?? undefined,
            allDay: allDayFlag,
            extendedProps: {
              description: description?.trim() || ''
            },
            color: 'var(--primary-color)'
          });
        },
        eventClick: (clickInfo) => {
          const ev = clickInfo.event;
          showEventDialog(ev);
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

  :global(.fc .fc-event-time) {
    font-weight: 500;
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

  /* Dialog styles */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-in-out;
  }

  .dialog {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dialog h2 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
  }

  .event-details {
    margin-bottom: 2rem;
  }

  .event-detail {
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: rgba(92, 107, 192, 0.05);
    border-radius: 6px;
    border-left: 3px solid var(--accent-color);
  }

  .event-detail-label {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .event-detail-value {
    color: var(--text-color);
    font-size: 1rem;
    word-wrap: break-word;
  }

  .dialog-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }

  .btn-primary:hover {
    background-color: #4a55a8;
    transform: translateY(-1px);
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background-color: var(--hover-color);
    color: var(--text-color);
  }

  .btn-secondary:hover {
    background-color: #d0d0d0;
    transform: translateY(-1px);
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


{#if showDialog && selectedEvent}
  <div class="dialog-overlay" on:click={closeDialog}>
    <div class="dialog" on:click|stopPropagation>
      <h2>Event Details</h2>
      
      <div class="event-details">
        <div class="event-detail">
          <div class="event-detail-label">Title</div>
          <div class="event-detail-value">{selectedEvent.title}</div>
        </div>
        
        <div class="event-detail">
          <div class="event-detail-label">Date</div>
          <div class="event-detail-value">{formatEventDate(selectedEvent)}</div>
        </div>
        
        <div class="event-detail">
          <div class="event-detail-label">Time</div>
          <div class="event-detail-value">{formatEventTime(selectedEvent)}</div>
        </div>
        
        {#if selectedEvent.extendedProps?.description}
          <div class="event-detail">
            <div class="event-detail-label">Description</div>
            <div class="event-detail-value">{selectedEvent.extendedProps.description}</div>
          </div>
        {/if}
      </div>
      
      <div class="dialog-buttons">
        <button class="btn btn-secondary" on:click={closeDialog}>Close</button>
        <button class="btn btn-primary" on:click={editEvent}>Edit</button>
        <button class="btn btn-danger" on:click={deleteEvent}>Delete</button>
      </div>
    </div>
  </div>
{/if}



