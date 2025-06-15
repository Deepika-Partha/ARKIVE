import {
  validateEventForm,
  createEventData,
  generateEventId,
  formatEventTime,
  formatEventDate,
  eventCategories
} from './calendarUtils';

function defaultForm(overrides: Partial<any> = {}) {
  return {
    title: 'Sample',
    description: '',
    category: 'work',
    startDate: '2025-06-15',
    endDate: '',
    startTime: '',
    endTime: '',
    allDay: true,
    recurring: 'none',
    recurringUntil: '',
    isEditing: false,
    eventToEdit: null,
    ...overrides
  };
}

describe('validateEventForm', () => {
  it('returns error if title is missing', () => {
    const form = defaultForm({ title: '' });
    expect(validateEventForm(form)).toContain('Event title is required');
  });

  it('returns error if startDate is missing', () => {
    const form = defaultForm({ startDate: '' });
    expect(validateEventForm(form)).toContain('Start date is required');
  });

  it('returns error if title is only whitespace', () => {
    const form = defaultForm({ title: '   ' });
    expect(validateEventForm(form)).toContain('Event title is required');
  });

  it('returns error if startTime is missing for timed event', () => {
    const form = defaultForm({ allDay: false, startTime: '' });
    const errors = validateEventForm(form);
    expect(errors.includes('Start time is required for timed events')).toBe(true);
  });

  it('adds error if startTime is missing but endTime is present on a timed event', () => {
    const form = defaultForm({
      allDay: false,
      startTime: '',
      endTime: '12:00'
    });
    const errors = validateEventForm(form);
    expect(errors).toContain('Start time is required for timed events');
  });

  it('does not return error when recurringUntil is after startDate', () => {
    const form = defaultForm({
      allDay: false,
      startTime: '10:00',
      endTime: '10:30',
      recurring: 'daily',
      recurringUntil: '2025-06-20'
    });
    const errors = validateEventForm(form);
    expect(errors.length).toBe(0);
  });

  it('does not return error when recurringUntil is missing on recurring event', () => {
    const form = defaultForm({
      allDay: false,
      recurring: 'daily',
      startTime: '09:00',
      endTime: '10:00',
      recurringUntil: ''
    });
    const errors = validateEventForm(form);
    expect(errors).not.toContain('Recurring end date must be after start date');
  });

  it('returns error if endTime is before startTime', () => {
    const form = defaultForm({
      allDay: false,
      startTime: '14:00',
      endTime: '12:00'
    });
    expect(validateEventForm(form)).toContain('End time must be after start time');
  });

  it('does not return error when endTime is after startTime', () => {
    const form = {
      title: 'Test Event',
      startDate: '2025-06-15',
      allDay: false,
      startTime: '09:00',
      endTime: '10:00',
      endDate: '2025-06-15',
      recurring: 'none',
      recurringUntil: '',
      category: 'work',
      description: '',
      isEditing: false,
      eventToEdit: null
    };

    const errors = validateEventForm(form);
    expect(errors.length).toBe(0);
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
    const form = defaultForm({
      title: 'Test Event',
      description: 'All day test',
      endDate: '2025-06-16'
    });
    const event = createEventData(form);
    expect(event.start).toBe('2025-06-15');
    expect(event.end).toBe('2025-06-16');
    expect(event.color).toBe(eventCategories.work.color);
    expect(event.extendedProps.description).toBe('All day test');
  });

  it('creates a timed event object', () => {
    const form = defaultForm({
      allDay: false,
      title: 'Call',
      description: 'Client call',
      category: 'personal',
      startTime: '10:00',
      endTime: '11:00'
    });
    const event = createEventData(form);
    expect(event.start).toBe('2025-06-15T10:00');
    expect(event.end).toBe('2025-06-15T11:00');
    expect(event.color).toBe(eventCategories.personal.color);
  });

  it('sets end as undefined when endTime is missing on timed event', () => {
    const form = defaultForm({
      allDay: false,
      startTime: '09:00'
    });
    const data = createEventData(form);
    expect(data.end).toBeUndefined();
  });

  it('falls back to "other" category if unknown category used', () => {
    const form = defaultForm({
      category: 'nonsense',
      allDay: false,
      startTime: '12:00'
    });
    const data = createEventData(form);
    expect(data.color).toBe(eventCategories.other.color);
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
      start: new Date('2025-06-15T12:00:00')
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







