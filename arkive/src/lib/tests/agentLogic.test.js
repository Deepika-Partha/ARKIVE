import { generateAIResponse, clearChat, clearFiles, prepareChatMessages } from '../agentLogic.js';

describe('generateAIResponse', () => {
  it('should return a message asking to upload textbooks when uploadedFiles is empty', () => {
    const input = 'What is AI?';
    const result = generateAIResponse(input, []);
    expect(result).toMatch(/upload some textbooks/i);
  });

  it('should return one of the predefined responses when uploadedFiles exist', () => {
    const input = 'What is AI?';
    const uploadedFiles = [{ name: 'textbook1.pdf' }];
    const result = generateAIResponse(input, uploadedFiles);
    expect(result).toMatch(/What is AI\?/);
  });
});

describe('clearChat', () => {
  it('should return an empty chat log and showChat false', () => {
    const result = clearChat();
    expect(result).toEqual({ chatLog: [], showChat: false });
  });
});

describe('clearFiles', () => {
  it('should clear uploaded files and return a system message', () => {
    const mockFileInput = { value: 'dummy' };
    const result = clearFiles(mockFileInput);
    expect(result.uploadedFiles).toEqual([]);
    expect(result.systemMessage.sender).toBe('system');
    expect(result.systemMessage.text).toMatch(/cleared/i);
    expect(result.showChat).toBe(true);
    expect(mockFileInput.value).toBe('');
  });

  it('should still work if fileInput is null', () => {
    const result = clearFiles(null);
    expect(result.uploadedFiles).toEqual([]);
    expect(result.systemMessage.sender).toBe('system');
    expect(result.systemMessage.text).toMatch(/cleared/i);
    expect(result.showChat).toBe(true);
  });
});

describe('prepareChatMessages', () => {
  it('should return formatted chat messages including system prompt and latest input', () => {
    const chatLog = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi!' },
      { sender: 'system', text: 'File uploaded' }
    ];
    const currentInput = 'What is AI?';
    const result = prepareChatMessages(chatLog, currentInput);

    expect(result[0]).toEqual({ role: 'system', content: 'You are a helpful assistant.' });
    expect(result[result.length - 1]).toEqual({ role: 'user', content: currentInput });
    expect(result.some(m => m.role === 'assistant')).toBe(true);
    expect(result.some(m => m.content === 'Hi!')).toBe(true);
    expect(result.some(m => m.content === 'File uploaded')).toBe(false); // should skip system message
  });
});


describe('prepareChatMessages', () => {
  it('should return only the system prompt and user input if chatLog is empty', () => {
    const result = prepareChatMessages([], 'Tell me about calculus');
    expect(result).toEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Tell me about calculus' }
    ]);
  });

  it('should skip system messages in the chatLog and format others properly', () => {
    const chatLog = [
      { sender: 'system', text: 'Uploaded: file.pdf' },
      { sender: 'user', text: 'Hi there!' },
      { sender: 'ai', text: 'Hello!' }
    ];
    const result = prepareChatMessages(chatLog, 'Next question?');
    expect(result).toEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hi there!' },
      { role: 'assistant', content: 'Hello!' },
      { role: 'user', content: 'Next question?' }
    ]);
  });
});
