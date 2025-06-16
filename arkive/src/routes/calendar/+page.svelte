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
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, hsla(30.73, 22.65%, 64.51%, 0.95) 0%, hsla(30.73, 22.65%, 70%, 0.95) 100%);
    color: var(--text-color);
    min-height: 100vh;
  }

  :root {
    --bg-color: hsla(30.73, 22.65%, 64.51%, 1);
    --bg-gradient: linear-gradient(135deg, hsla(30.73, 22.65%, 64.51%, 0.95) 0%, hsla(30.73, 22.65%, 70%, 0.95) 100%);
    --text-color: #1e1e1e;
    --text-secondary: #2d2721;
    --primary-color: #2d2721;
    --secondary-color: #d4bfae;
    --card-bg: rgba(255, 255, 255, 0.95);
    --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    --editor-bg: #ffffff;
    --border-color: rgba(30, 30, 30, 0.12);
    --hover-color: rgba(45, 39, 33, 0.05);
    --accent-color: #2d2721;
    --success-color: #2d2721;
    --danger-color: #8b4513;
    --warning-color: #cd853f;
    --glass-bg: rgba(255, 255, 255, 0.25);
    --glass-border: rgba(255, 255, 255, 0.18);
  }

  nav {
    background: rgba(212, 191, 174, 0.95);
    backdrop-filter: blur(20px);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  }

  .logo {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    text-decoration: none;
    letter-spacing: -0.5px;
    transition: all 0.3s ease;
  }

  .logo:hover {
    opacity: 0.8;
    transform: translateY(-1px);
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
    font-size: 0.95rem;
    transition: all 0.3s ease;
    padding: 0.75rem 1.25rem;
    border-radius: 25px;
    position: relative;
    border-bottom: none;
  }

  .nav-links a:hover {
    color: var(--primary-color);
    background-color: var(--hover-color);
    transform: translateY(-2px);
  }

  .nav-links a.active {
    color: var(--secondary-color);
    background-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(45, 39, 33, 0.3);
  }

  .page-wrapper {
    padding: 2.5rem 3rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
  }

  .header-content h1 {
    font-size: 2.25rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
    letter-spacing: -1px;
    background: linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtext {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
    opacity: 0.8;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .calendar-container {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    box-shadow: var(--card-shadow);
    padding: 2rem;
    height: 80vh;
    position: relative;
    overflow: hidden;
  }

  .calendar-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    opacity: 0.3;
  }

  #calendar {
    width: 100%;
    height: 100%;
  }

  /* Enhanced Button styles */
  .btn {
    padding: 0.875rem 1.75rem;
    border: none;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.25px;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--primary-color) 100%);
    color: var(--secondary-color);
    box-shadow: 0 4px 15px rgba(45, 39, 33, 0.2);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, var(--primary-color) 0%, #1a1614 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(45, 39, 33, 0.3);
  }

  .btn-success {
    background: linear-gradient(135deg, var(--success-color) 0%, #1a1614 100%);
    color: var(--secondary-color);
    box-shadow: 0 4px 15px rgba(45, 39, 33, 0.2);
  }

  .btn-success:hover {
    background: linear-gradient(135deg, #1a1614 0%, #0f0c0a 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(45, 39, 33, 0.3);
  }

  .btn-danger {
    background: linear-gradient(135deg, var(--danger-color) 0%, #a0522d 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(139, 69, 19, 0.2);
  }

  .btn-danger:hover {
    background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
  }

  .btn-secondary {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    color: var(--text-color);
    border: 1px solid var(--glass-border);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  /* Enhanced Dialog styles */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
  }

  .dialog {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .dialog::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    opacity: 0.5;
  }

  .form-dialog {
    max-width: 600px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateY(-30px) scale(0.9);
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1);
    }
  }

  .dialog h2 {
    margin: 0 0 2rem 0;
    color: var(--text-color);
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .event-details {
    margin-bottom: 2rem;
  }

  .event-detail {
    margin-bottom: 1.25rem;
    padding: 1rem;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
    border-left: 4px solid var(--accent-color);
    transition: all 0.3s ease;
  }

  .event-detail:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }

  .event-detail-label {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .event-detail-value {
    color: var(--text-color);
    font-size: 1rem;
    font-weight: 500;
    word-wrap: break-word;
  }

  .category-badge {
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    background: var(--accent-color);
    color: var(--secondary-color);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
    letter-spacing: 0.5px;
  }

  .dialog-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  /* Enhanced Form styles */
  .form-group {
    margin-bottom: 1.75rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  label {
    display: block;
    margin-bottom: 0.75rem;
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
    letter-spacing: 0.25px;
  }

  input, select, textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 4px rgba(45, 39, 33, 0.1);
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--glass-bg);
    border-radius: 12px;
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;
  }

  .checkbox-group:hover {
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.4);
  }

  .checkbox-group input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--accent-color);
  }

  /* Enhanced Calendar customization */
  :global(.fc) {
    font-size: 0.9rem;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  :global(.fc .fc-toolbar-title) {
    font-weight: 700;
    font-size: 1.75rem;
    color: var(--text-color);
    letter-spacing: -0.5px;
  }

  :global(.fc .fc-button) {
    background: var(--glass-bg) !important;
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border) !important;
    color: var(--text-color) !important;
    border-radius: 10px !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
  }

  :global(.fc .fc-button:hover) {
    background: var(--accent-color) !important;
    color: var(--secondary-color) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(45, 39, 33, 0.2) !important;
  }

  :global(.fc .fc-button-active) {
    background: var(--accent-color) !important;
    color: var(--secondary-color) !important;
  }

  :global(.fc .fc-col-header-cell-cushion) {
    font-weight: 600;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  :global(.fc .fc-daygrid-day-number) {
    font-weight: 600;
    color: var(--text-color);
    text-decoration: none;
    text-align: center;
    display: block;
    transition: all 0.3s ease;
  }

  :global(.fc .fc-event) {
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    animation: eventFadeIn 0.3s ease-in-out;
    cursor: pointer;
    border: none;
    backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.fc .fc-event:hover) {
    opacity: 0.9;
    transform: scale(1.05) translateY(-2px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  }

  :global(.fc .fc-event-time) {
    font-weight: 600;
  }

  :global(.fc .fc-day-today) {
    background: rgba(45, 39, 33, 0.08) !important;
    border: 2px solid var(--accent-color) !important;
    box-shadow: 0 0 15px rgba(45, 39, 33, 0.15);
    border-radius: 8px !important;
  }

  :global(.fc .fc-daygrid-day:hover) {
    background: rgba(45, 39, 33, 0.05) !important;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :global(.fc .fc-timegrid-slot:hover) {
    background: rgba(45, 39, 33, 0.05) !important;
  }

  :global(.fc-theme-standard td, .fc-theme-standard th) {
    border-color: var(--border-color) !important;
  }

  @keyframes eventFadeIn {
    from { 
      opacity: 0; 
      transform: scale(0.95) translateY(10px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }

  /* Enhanced Responsive design */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 1.5rem;
    }

    nav {
      padding: 1rem 1.5rem;
      flex-direction: column;
      gap: 1rem;
    }

    .nav-links {
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .nav-links a {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .header-content h1 {
      font-size: 1.75rem;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .calendar-container {
      height: 70vh;
      padding: 1rem;
    }

    .dialog {
      margin: 1rem;
      padding: 2rem;
      border-radius: 16px;
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

    .btn {
      padding: 0.75rem 1.5rem;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 480px) {
    nav {
      padding: 1rem;
    }

    .page-wrapper {
      padding: 1rem;
    }

    .page-header {
      padding: 1rem;
    }

    .header-content h1 {
      font-size: 1.5rem;
    }

    .calendar-container {
      height: 65vh;
      padding: 0.75rem;
    }

    .dialog {
      padding: 1.5rem;
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



