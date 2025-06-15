export function validateEventForm(form: any): string[] {
  const errors: string[] = [];
  if (!form.title?.trim()) errors.push('Event title is required');
  if (!form.startDate) errors.push('Start date is required');
  return errors;
}
export const eventCategories = {
  work:      { name: 'Work', color: '#9F7AEA' },
  personal:  { name: 'Personal', color: '#F6AD55' },
  health:    { name: 'Health', color: '#68D391' },
  social:    { name: 'Social', color: '#F687B3' },
  travel:    { name: 'Travel', color: '#63B3ED' },
  important: { name: 'Important', color: '#E53E3E' },
  other:     { name: 'Other', color: '#A0AEC0' }
};

export function generateEventId(): string {
  return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export function createEventData(form: any): any {
  const category = eventCategories[form.category] || eventCategories.other;
  let start, end;

  if (form.allDay) {
    start = form.startDate;
    end = form.endDate || undefined;
  } else {
    start = `${form.startDate}T${form.startTime}`;
    end = form.endTime ? `${form.endDate || form.startDate}T${form.endTime}` : undefined;
  }

  return {
    id: form.isEditing && form.eventToEdit ? form.eventToEdit.id : generateEventId(),
    title: form.title.trim(),
    start,
    end,
    allDay: form.allDay,
    color: category.color,
    extendedProps: {
      category: form.category,
      description: form.description.trim(),
      recurring: form.recurring
    }
  };
}

export function formatEventTime(event: any): string {
  if (event.allDay) return 'All Day';

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return event.end ? `${formatTime(event.start)} - ${formatTime(event.end)}` : formatTime(event.start);
}

export function formatEventDate(event: any): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (event.end && !event.allDay) {
    const startStr = formatDate(event.start);
    const endStr = formatDate(event.end);
    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  }

  return formatDate(event.start);
}

