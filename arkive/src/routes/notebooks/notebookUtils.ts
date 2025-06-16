// notebookUtils.ts

// Generates a pseudo-unique ID for a note
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Persists notes and categories to localStorage (or mockable storage)
export function persistData(
  notes: object,
  categories: string[],
  localStore: Storage = localStorage
): void {
  localStore.setItem('arkive-notes', JSON.stringify(notes));
  localStore.setItem('arkive-categories', JSON.stringify(categories));
}

// Validates a new category name
export function isValidNewCategory(name: string, existing: string[]): boolean {
  const trimmed = name.trim();
  return trimmed !== '' && !existing.includes(trimmed);
}

// Parses a PDF file using pdfjsLib
export async function parsePdf(file: File, pdfjsLib: any): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}
