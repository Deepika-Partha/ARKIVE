import { generateId, persistData, isValidNewCategory, parsePdf } from './notebookUtils';
import mammoth from 'mammoth';

if (!File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function () {
    return Promise.resolve(Buffer.from('dummy'));
  };
}

jest.mock('mammoth', () => ({
  convertToHtml: jest.fn(() => Promise.resolve({ value: '<p>Test</p>' }))
}));
const mockPdfjsLib = {
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 2,
      getPage: jest.fn().mockImplementation((pageNum: number) => {
        return Promise.resolve({
          getTextContent: () =>
            Promise.resolve({
              items: [
                { str: `Page ${pageNum} - Hello` },
                { str: `Page ${pageNum} - World` },
              ],
            }),
        });
      }),
    }),
  }),
};

describe('DOCX Upload', () => {
  it('should parse a docx file into HTML content', async () => {
    const fakeFile = new File(['fake-docx'], 'file.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const result = await mammoth.convertToHtml({ arrayBuffer: await fakeFile.arrayBuffer() });
    expect(result.value).toContain('<p>');
  });
});

describe('generateId', () => {
  it('should generate a unique string each time', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toEqual(id2);
    expect(typeof id1).toBe('string');
  });
});

describe('persistData', () => {
  it('should save notes and categories to localStorage', () => {
    const mockStorage: Storage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0,
    };

    const notes = { General: [{ id: 'abc', text: 'test note' }] };
    const categories = ['General'];

    persistData(notes, categories, mockStorage);
    
    expect(mockStorage.setItem).toHaveBeenCalledWith('arkive-notes', JSON.stringify(notes));
    expect(mockStorage.setItem).toHaveBeenCalledWith('arkive-categories', JSON.stringify(categories));
  });

  it('should default to localStorage when no storage is passed', () => {
    const notes = { General: [{ id: 'xyz', text: 'note via default store' }] };
    const categories = ['General'];

    const originalStorage = global.localStorage;
    const mockSetItem = jest.fn();

    // ✅ Replace the global localStorage with a mock version
    Object.defineProperty(global, 'localStorage', {
        value: {
        setItem: mockSetItem,
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0
        },
        configurable: true
    });

    persistData(notes, categories); // should trigger default param

    expect(mockSetItem).toHaveBeenCalledWith('arkive-notes', JSON.stringify(notes));
    expect(mockSetItem).toHaveBeenCalledWith('arkive-categories', JSON.stringify(categories));

    // ✅ Restore original localStorage after test
    Object.defineProperty(global, 'localStorage', {
        value: originalStorage
    });
    });
});

describe('isValidNewCategory', () => {
  it('should reject empty or duplicate categories', () => {
    expect(isValidNewCategory('   ', ['Work'])).toBe(false);
    expect(isValidNewCategory('Work', ['Work'])).toBe(false);
  });

  it('should accept a valid new category name', () => {
    expect(isValidNewCategory('NewCat', ['Work', 'Personal'])).toBe(true);
  });

  it('should reject category with only whitespace', () => {
    expect(isValidNewCategory('   ', ['Anything'])).toBe(false);
    });

    it('should reject category if it already exists', () => {
    expect(isValidNewCategory('Work', ['Work'])).toBe(false);
    });

    it('should accept valid trimmed category', () => {
    expect(isValidNewCategory('  NewCategory ', ['Work'])).toBe(true);
    });

    it('should reject a non-empty name that already exists', () => {
    expect(isValidNewCategory('Work', ['Work', 'Personal'])).toBe(false);
    });

    it('should reject a blank name that does not exist in the list', () => {
    expect(isValidNewCategory('   ', ['NothingHere'])).toBe(false);
    });
});

describe('parsePdf', () => {
  it('should extract text from all pages of a PDF', async () => {
    const fakePdfFile = new File(['%PDF'], 'test.pdf', { type: 'application/pdf' });
    const result = await parsePdf(fakePdfFile, mockPdfjsLib);
    expect(result).toContain('Page 1 - Hello');
    expect(result).toContain('Page 2 - World');
  });

  it('should handle an empty PDF gracefully', async () => {
    const emptyMockLib = {
      getDocument: jest.fn().mockReturnValue({
        promise: Promise.resolve({
          numPages: 0,
          getPage: jest.fn(),
        }),
      }),
    };
    const emptyPdf = new File([''], 'empty.pdf', { type: 'application/pdf' });
    const result = await parsePdf(emptyPdf, emptyMockLib);
    expect(result).toBe('');
  });
});
