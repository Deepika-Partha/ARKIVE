import {
  validateEventForm,
  createEventData,
  generateEventId,
  formatEventTime,
  formatEventDate,
  eventCategories
} from './calendarUtils';

describe('validateEventForm', () => {
  it('returns error if title is missing', () => {
    const form = { title: '', startDate: '2025-06-14' };
    expect(validateEventForm(form)).toContain('Event title is required');
  });

  it('returns error if startDate is missing', () => {
    const form = { title: 'Test', startDate: '' };
    expect(validateEventForm(form)).toContain('Start date is required');
  });
});

describe('generateEventId', () => {
  it('should generate a unique event ID with expected format', () => {
    const id = generateEventId();
    expect(id).toMatch(/^event_[a-z0-9]+_[0-9]+$/);
  });
});

describe('createEventData', () => {
  it('creates an all-day event object', () => {
    const form = {
      title: 'Test Event',
      description: 'All day test',
      category: 'work',
      startDate: '2025-06-15',
      endDate: '2025-06-16',
      allDay: true,
      isEditing: false,
      recurring: 'none'
    };
    const event = createEventData(form);
    expect(event.start).toBe('2025-06-15');
    expect(event.end).toBe('2025-06-16');
    expect(event.color).toBe(eventCategories.work.color);
    expect(event.extendedProps.description).toBe('All day test');
  });

  it('creates a timed event object', () => {
    const form = {
      title: 'Call',
      description: 'Client call',
      category: 'personal',
      startDate: '2025-06-15',
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      isEditing: false,
      recurring: 'none'
    };
    const event = createEventData(form);
    expect(event.start).toBe('2025-06-15T10:00');
    expect(event.end).toBe('2025-06-15T11:00');
    expect(event.color).toBe(eventCategories.personal.color);
  });
});

describe('formatEventTime', () => {
  it('returns "All Day" for all-day events', () => {
    const result = formatEventTime({ allDay: true });
    expect(result).toBe('All Day');
  });

  it('formats time range correctly', () => {
    const event = {
      allDay: false,
      start: new Date('2025-06-15T14:00:00'),
      end: new Date('2025-06-15T15:30:00')
    };
    const result = formatEventTime(event);
    expect(result).toMatch(/2:00 PM - 3:30 PM/);
  });
});

describe('formatEventDate', () => {
  it('formats a single date correctly', () => {
    const event = {
      allDay: true,
      start: new Date('2025-06-15T12:00:00') // Use noon to avoid timezone shift
    };
    const result = formatEventDate(event);
    expect(result).toMatch(/Sunday, June 15, 2025/);
  });

  it('formats date range for timed event correctly', () => {
    const event = {
      allDay: false,
      start: new Date('2025-06-15T12:00:00'),
      end: new Date('2025-06-16T12:00:00')
    };
    const result = formatEventDate(event);
    expect(result).toMatch(/Sunday, June 15, 2025 - Monday, June 16, 2025/);
  });
});




