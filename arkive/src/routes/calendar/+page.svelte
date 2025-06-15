<script lang="ts">
  import '../../app.css';
  import { onMount } from 'svelte';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import interactionPlugin from '@fullcalendar/interaction';

  let calendar: Calendar | null = null;
  let showDialog = false;
  let showEventForm = false;
  let selectedEvent: any = null;
  let selectedDate = '';
  
  // Event form data
  let eventForm = {
    title: '',
    description: '',
    category: 'work',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: true,
    recurring: 'none',
    recurringUntil: '',
    isEditing: false,
    eventToEdit: null
  };

  // Event categories with colors
  const eventCategories = {
  work:      { name: 'Work',      color: '#9F7AEA' }, // lavender purple 
  personal:  { name: 'Personal',  color: '#F6AD55' }, // soft orange
  health:    { name: 'Health',    color: '#68D391' }, // mint green
  social:    { name: 'Social',    color: '#F687B3' }, // rose pink
  travel:    { name: 'Travel',    color: '#63B3ED' }, // sky blue
  important: { name: 'Important', color: '#E53E3E' }, // bold red
  other:     { name: 'Other',     color: '#A0AEC0' }  // slate gray
};

  // Storage functions
  function saveEventsToStorage(events: any[]) {
    try {
      const eventsData = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start?.toISOString(),
        end: event.end?.toISOString(),
        allDay: event.allDay,
        color: event.color,
        extendedProps: event.extendedProps
      }));
      localStorage.setItem('arkive-calendar-events', JSON.stringify(eventsData));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }

  function loadEventsFromStorage() {
    try {
      const stored = localStorage.getItem('arkive-calendar-events');
      return stored
  ? JSON.parse(stored).map((event: any) => {
      const categoryKey = event.extendedProps?.category as keyof typeof eventCategories || 'other';
      const category = eventCategories[categoryKey] || eventCategories.other;
      return {
        ...event,
        color: category.color
      };
    })
  : [];

    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }

  function saveEvent() {
    if (!calendar) return;

    const errors = validateEventForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    const eventData = createEventData();
    
    if (eventForm.isEditing && eventForm.eventToEdit) {
      // Update existing event
      const existingEvent = eventForm.eventToEdit;
      existingEvent.setProp('title', eventData.title);
      existingEvent.setStart(eventData.start);
      existingEvent.setEnd(eventData.end);
      existingEvent.setAllDay(eventData.allDay);
      existingEvent.setProp('color', eventData.color);
      existingEvent.setExtendedProp('category', eventData.extendedProps.category);
      existingEvent.setExtendedProp('description', eventData.extendedProps.description);
      existingEvent.setExtendedProp('recurring', eventData.extendedProps.recurring);
    } else {
      // Create new event
      if (eventForm.recurring !== 'none') {
        createRecurringEvents(eventData);
      } else {
        calendar.addEvent(eventData);
      }
    }

    // Save to storage
    const allEvents = calendar.getEvents();
    saveEventsToStorage(allEvents);

    closeEventForm();
  }

  function createEventData() {
    const category = eventCategories[eventForm.category];
    let start, end;

    if (eventForm.allDay) {
      start = eventForm.startDate;
      end = eventForm.endDate || undefined;
    } else {
      start = `${eventForm.startDate}T${eventForm.startTime}`;
      end = eventForm.endTime ? `${eventForm.endDate || eventForm.startDate}T${eventForm.endTime}` : undefined;
    }

    return {
      id: eventForm.isEditing ? eventForm.eventToEdit.id : generateEventId(),
      title: eventForm.title.trim(),
      start,
      end,
      allDay: eventForm.allDay,
      color: category.color,
      extendedProps: {
        category: eventForm.category,
        description: eventForm.description.trim(),
        recurring: eventForm.recurring
      }
    };
  }

  function createRecurringEvents(baseEvent: any) {
    if (!calendar) return;

    const startDate = new Date(baseEvent.start);
    const endDate = eventForm.recurringUntil ? new Date(eventForm.recurringUntil) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
    
    let currentDate = new Date(startDate);
    let eventCount = 0;
    const maxEvents = 100; // Prevent infinite loops

    while (currentDate <= endDate && eventCount < maxEvents) {
      const eventData = {
        ...baseEvent,
        id: generateEventId(),
        start: eventForm.allDay ? 
          currentDate.toISOString().split('T')[0] : 
          `${currentDate.toISOString().split('T')[0]}T${eventForm.startTime}`,
        end: baseEvent.end ? (eventForm.allDay ? 
          (eventForm.endDate ? new Date(currentDate.getTime() + (new Date(eventForm.endDate).getTime() - new Date(eventForm.startDate).getTime())).toISOString().split('T')[0] : undefined) :
          `${currentDate.toISOString().split('T')[0]}T${eventForm.endTime}`) : undefined
      };

      calendar.addEvent(eventData);
      eventCount++;

      // Calculate next occurrence
      switch (eventForm.recurring) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        default:
          break;
      }
    }
  }

  function validateEventForm() {
    const errors = [];

    if (!eventForm.title.trim()) {
      errors.push('Event title is required');
    }

    if (!eventForm.startDate) {
      errors.push('Start date is required');
    }

    if (!eventForm.allDay) {
      if (!eventForm.startTime) {
        errors.push('Start time is required for timed events');
      }
      
      if (eventForm.endTime) {
        const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
        const endDateTime = new Date(`${eventForm.endDate || eventForm.startDate}T${eventForm.endTime}`);
        
        if (endDateTime <= startDateTime) {
          errors.push('End time must be after start time');
        }
      }
    }

    if (eventForm.recurring !== 'none' && eventForm.recurringUntil) {
      const startDate = new Date(eventForm.startDate);
      const untilDate = new Date(eventForm.recurringUntil);
      
      if (untilDate <= startDate) {
        errors.push('Recurring end date must be after start date');
      }
    }

    return errors;
  }

  function generateEventId() {
    return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function showEventDialog(event: any) {
    selectedEvent = event;
    showDialog = true;
  }

  function closeDialog() {
    showDialog = false;
    selectedEvent = null;
  }

  function openEventForm(date = '') {
    resetEventForm();
    if (date) {
      eventForm.startDate = date;
      selectedDate = date;
    }
    showEventForm = true;
  }

  function openEditForm(event: any) {
    resetEventForm();
    eventForm.isEditing = true;
    eventForm.eventToEdit = event;
    eventForm.title = event.title;
    eventForm.description = event.extendedProps?.description || '';
    eventForm.category = event.extendedProps?.category || 'work';
    
    const startDate = event.start;
    eventForm.startDate = startDate.toISOString().split('T')[0];
    
    if (!event.allDay) {
      eventForm.allDay = false;
      eventForm.startTime = startDate.toTimeString().slice(0, 5);
      
      if (event.end) {
        const endDate = event.end;
        eventForm.endDate = endDate.toISOString().split('T')[0];
        eventForm.endTime = endDate.toTimeString().slice(0, 5);
      }
    } else {
      eventForm.allDay = true;
      if (event.end) {
        const endDate = new Date(event.end.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day for all-day events
        eventForm.endDate = endDate.toISOString().split('T')[0];
      }
    }
    
    closeDialog();
    showEventForm = true;
  }

  function closeEventForm() {
    showEventForm = false;
    resetEventForm();
  }

  function resetEventForm() {
    eventForm = {
      title: '',
      description: '',
      category: 'work',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      allDay: true,
      recurring: 'none',
      recurringUntil: '',
      isEditing: false,
      eventToEdit: null
    };
  }

  function deleteEvent() {
    if (selectedEvent) {
      selectedEvent.remove();
      
      // Save updated events to storage
      const allEvents = calendar?.getEvents() || [];
      saveEventsToStorage(allEvents);
      
      closeDialog();
    }
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
    const end = event.end;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    if (end && !event.allDay) {
      const startDate = formatDate(start);
      const endDate = formatDate(end);
      return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    }
    
    return formatDate(start);
  }

  function exportEvents() {
    const events = calendar?.getEvents() || [];
    const eventsData = events.map(event => ({
      title: event.title,
      start: event.start?.toISOString(),
      end: event.end?.toISOString(),
      allDay: event.allDay,
      category: event.extendedProps?.category,
      description: event.extendedProps?.description
    }));
    
    const dataStr = JSON.stringify(eventsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arkive-calendar-events.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  function importEvents(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const eventsData = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(eventsData)) {
          eventsData.forEach(eventData => {
            if (eventData.title && eventData.start) {
              const category = eventCategories[eventData.category] || eventCategories.other;
              calendar?.addEvent({
                ...eventData,
                color: category.color
              });
            }
          });
          
          // Save to storage
          const allEvents = calendar?.getEvents() || [];
          saveEventsToStorage(allEvents);
          
          alert('Events imported successfully!');
        }
      } catch (error) {
        alert('Failed to import events. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    input.value = ''; // Reset input
  }

  onMount(() => {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
      calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        selectable: true,
        editable: true,
        droppable: true,
        dragScroll: true,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: '100%',
        eventTimeFormat: {
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        },
        displayEventEnd: true,
        eventDisplay: 'block',
        events: loadEventsFromStorage(),
        dateClick: (info) => {
          openEventForm(info.dateStr);
        },
        eventClick: (clickInfo) => {
          showEventDialog(clickInfo.event);
        },
        eventDrop: (info) => {
          // Save updated events after drag and drop
          const allEvents = calendar?.getEvents() || [];
          saveEventsToStorage(allEvents);
        },
        eventResize: (info) => {
          // Save updated events after resize
          const allEvents = calendar?.getEvents() || [];
          saveEventsToStorage(allEvents);
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
    --accent-color: #626a97;
    --success-color: #626a97;
    --danger-color: #768A96;
    --warning-color: #AAC7d8;
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-content h1 {
    font-size: 2rem;
    margin: 0 0 0.5rem 0;
  }

  .subtext {
    font-size: 1rem;
    color: #555;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
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

  /* Button styles */
  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }

  .btn-primary:hover {
    background-color: #40466d;
    transform: translateY(-1px);
  }

  .btn-success {
    background-color: var(--success-color);
    color: white;
  }

  .btn-success:hover {
    background-color: #40466d;
    transform: translateY(-1px);
  }

  .btn-danger {
    background-color: var(--danger-color);
    color: white;
  }

  .btn-danger:hover {
    background-color: #dc2626;
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
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
  }

  .form-dialog {
    max-width: 600px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dialog h2 {
    margin: 0 0 1.5rem 0;
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

  .category-badge {
    display: inline-block;
    /* padding: 0.25rem 0.75rem; */
    border-radius: 20px;
    color: black;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .dialog-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  /* Form styles */
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
  }

  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.1);
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-group input[type="checkbox"] {
    width: auto;
    margin: 0;
    accent-color: var(--accent-color);
  }


  /* Calendar customization */
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
    animation: eventFadeIn 0.2s ease-in-out;
    cursor: pointer;
    border: none;
  }

  :global(.fc .fc-event:hover) {
    opacity: 0.8;
    transform: scale(1.02);
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

  :global(.fc .fc-timegrid-slot:hover) {
    background: rgba(92, 107, 192, 0.05);
  }

  @keyframes eventFadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 1rem;
    }

    nav {
      padding: 1rem;
      flex-direction: column;
      gap: 1rem;
    }

    .nav-links {
      gap: 1rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .calendar-container {
      height: 70vh;
    }

    .dialog {
      margin: 1rem;
      padding: 1.5rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .dialog-buttons {
      justify-content: stretch;
    }

    .dialog-buttons .btn {
      flex: 1;
      justify-content: center;
    }
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
  <div class="page-header">
    <div class="header-content">
      <h1>Calendar</h1>
      <p class="subtext">Drag events to move them, click dates to add events, and organize with categories</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" on:click={() => openEventForm()}>
        + New Event
      </button>
    </div>
  </div>

  <div class="calendar-container">
    <div id="calendar"></div>
  </div>
</div>

<!-- Event Details Dialog -->
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
          <div class="event-detail-label">Category</div>
          <div class="event-detail-value">
            <span class="category-badge" style="background-color: {selectedEvent.color}">
              {eventCategories[selectedEvent.extendedProps?.category]?.name || 'Other'}
            </span>
          </div>
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

        {#if selectedEvent.extendedProps?.recurring && selectedEvent.extendedProps.recurring !== 'none'}
          <div class="event-detail">
            <div class="event-detail-label">Recurring</div>
            <div class="event-detail-value">{selectedEvent.extendedProps.recurring}</div>
          </div>
        {/if}
      </div>
      
      <div class="dialog-buttons">
        <button class="btn btn-secondary" on:click={closeDialog}>Close</button>
        <button class="btn btn-primary" on:click={() => openEditForm(selectedEvent)}>Edit</button>
        <button class="btn btn-danger" on:click={deleteEvent}>Delete</button>
      </div>
    </div>
  </div>
{/if}

<!-- Event Form Dialog -->
{#if showEventForm}
  <div class="dialog-overlay" on:click={closeEventForm}>
    <div class="dialog form-dialog" on:click|stopPropagation>
      <h2>{eventForm.isEditing ? 'Edit Event' : 'Create New Event'}</h2>
      
      <form on:submit|preventDefault={saveEvent}>
        <div class="form-group">
          <label for="title">Event Title *</label>
          <input
            type="text"
            id="title"
            bind:value={eventForm.title}
            placeholder="Enter event title"
            required
          />
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" bind:value={eventForm.category}>
            {#each Object.entries(eventCategories) as [key, category]}
              <option value={key}>{category.name}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            bind:value={eventForm.description}
            placeholder="Enter event description (optional)"
          ></textarea>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <input
              type="checkbox"
              id="allDay"
              bind:checked={eventForm.allDay}
            />
            <label for="allDay">All Day Event</label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              bind:value={eventForm.startDate}
              required
            />
          </div>
          
          {#if !eventForm.allDay}
            <div class="form-group">
              <label for="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                bind:value={eventForm.startTime}
                required={!eventForm.allDay}
              />
            </div>
          {/if}
        </div>

        {#if !eventForm.allDay || eventForm.endDate}
          <div class="form-row">
            <div class="form-group">
              <label for="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                bind:value={eventForm.endDate}
              />
            </div>
            
            {#if !eventForm.allDay}
              <div class="form-group">
                <label for="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  bind:value={eventForm.endTime}
                />
              </div>
            {/if}
          </div>
        {/if}

        {#if !eventForm.isEditing}
          <div class="form-group">
            <label for="recurring">Recurring</label>
            <select id="recurring" bind:value={eventForm.recurring}>
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {#if eventForm.recurring !== 'none'}
            <div class="form-group">
              <label for="recurringUntil">Repeat Until</label>
              <input
                type="date"
                id="recurringUntil"
                bind:value={eventForm.recurringUntil}
                placeholder="Leave empty for 1 year"
              />
            </div>
          {/if}
        {/if}

        <div class="dialog-buttons">
          <button type="button" class="btn btn-secondary" on:click={closeEventForm}>
            Cancel
          </button>
          <button type="submit" class="btn btn-success">
            {eventForm.isEditing ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}



