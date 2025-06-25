// src/lib/agentLogic.js

export function generateAIResponse(input, uploadedFiles) {
    const responses = [
      `Based on your uploaded textbooks, I can help you with "${input}". Let me analyze the relevant sections...`,
      `I found relevant information in your textbooks about "${input}". Here's what I discovered...`,
      `Great question about "${input}"! According to the materials you've uploaded...`,
      `Let me reference your textbooks to answer "${input}". From what I can see...`
    ];
  
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return "I'd be happy to help you with that! Please upload some textbooks first so I can provide more accurate, context-specific answers.";
    }
  
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  export function clearChat() {
    return {
      chatLog: [],
      showChat: false
    };
  }
  
  export function clearFiles(fileInput) {
    if (fileInput) fileInput.value = '';
  
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      uploadedFiles: [],
      systemMessage: {
        sender: 'system',
        text: '🗑️ All uploaded files have been cleared.',
        timestamp
      },
      showChat: true
    };
  }
  
  export function prepareChatMessages(chatLog, currentInput) {
    const systemPrompt = { role: 'system', content: 'You are a helpful assistant.' };
    const formattedMessages = chatLog
      .filter(m => m.sender !== 'system')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
  
    return [systemPrompt, ...formattedMessages, { role: 'user', content: currentInput }];
  }
  