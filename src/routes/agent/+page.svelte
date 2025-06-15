<script>
	let fileInput;
	let chatLog = [];
	let userInput = "";
	let showChat = false;
	let isLoading = false;
	let uploadedFiles = [];
	
	function fileUpload(){
		fileInput.click();
	}
	
	function handleFileChange(event){
		const files = Array.from(event.target.files);
		uploadedFiles = [...uploadedFiles, ...files];
		
		// Show confirmation message
		if (files.length > 0) {
			const fileNames = files.map(f => f.name).join(', ');
			const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
			chatLog = [...chatLog, {
				sender: "system", 
				text: `Uploaded: ${fileNames}`
				// timestamp: timestamp
			}];
			showChat = true;
			scrollToBottom();
		}
	}
	
	async function sendMsg(){
		if (userInput.trim() !== "" && !isLoading){
			const now = new Date();
			const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
			
			// Add user message
			chatLog = [...chatLog, {sender: "user", text: userInput, timestamp: timestamp}];
			const currentInput = userInput;
			userInput = "";
			showChat = true;
			
			// actual AI API call
			isLoading = true;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              ...chatLog
                .filter(m => m.sender !== 'system') // skip file upload/system messages
                .map(m => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text
                })),
              { role: 'user', content: currentInput }
            ]
          })
        });

        const data = await response.json();
        const aiResponse = data.reply || '⚠️ No reply received.';
        const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatLog = [...chatLog, {
          sender: "ai",
          text: aiResponse,
          timestamp: aiTimestamp
        }];
      } catch (error) {
        console.error("AI fetch failed:", error);
        const errorTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        chatLog = [...chatLog, {
          sender: "ai",
          text: "⚠️ There was an issue contacting the assistant. Please try again later.",
          timestamp: errorTimestamp
        }];
      } finally {
        isLoading = false;
        scrollToBottom();
      }

		}
		scrollToBottom();
	}
	
	function generateAIResponse(input) {
		// Simple response generation based on uploaded files
		const responses = [
			`Based on your uploaded textbooks, I can help you with "${input}". Let me analyze the relevant sections...`,
			`I found relevant information in your textbooks about "${input}". Here's what I discovered...`,
			`Great question about "${input}"! According to the materials you've uploaded...`,
			`Let me reference your textbooks to answer "${input}". From what I can see...`
		];
		
		if (uploadedFiles.length === 0) {
			return "I'd be happy to help you with that! Please upload some textbooks first so I can provide more accurate, context-specific answers.";
		}
		
		return responses[Math.floor(Math.random() * responses.length)];
	}
	
	function clearChat(){
		chatLog = [];
		showChat = false;
	}
	
	function clearFiles(){
		uploadedFiles = [];
		if (fileInput) {
			fileInput.value = '';
		}
		const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
		chatLog = [...chatLog, {
			sender: "system", 
			text: "🗑️ All uploaded files have been cleared.", 
			timestamp: timestamp
		}];
		showChat = true;
		scrollToBottom();
	}
	
	function scrollToBottom() {
		setTimeout(() => {
			const chatLogDiv = document.querySelector(".chat-log"); 
			if (chatLogDiv){
				chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
			}
		}, 100);
	}
	
	function handleKeydown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMsg();
		}
	}
	
	function autoResizeTextarea(e) {
		e.target.style.height = 'auto';
		e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
	}
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
    --ai-bubble-bg: #f0f0f0;
    --system-bubble-bg: #e8f4fd;
  }
  
  nav {
    background-color: var(--bg-color);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0,0,0,0.25);
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

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e1e1e;
    text-decoration: none;
  }
  
  .chat-btn, .send-btn, .clear-btn {
    padding: 0.75rem 1.5rem;
    background-color: #2d2721;
    color: #d4bfae;
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 90px;
  }
  
  .chat-btn:hover, .send-btn:hover, .clear-btn:hover {
    background-color: hsla(30.73, 22.65%, 64.51%, 1);
    color: #000000; 
    border: 2px solid #000000;
    transform: translateY(-1px);
  }
  
  .chat-btn:disabled, .send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .layout {
    display: flex;
    height: calc(100vh - 80px);
    background-color: var(--bg-color);
  }
  
  .sidebar {
    width: 250px;
    background-color: #927c66;
    border-right: 1px solid var(--hover-color);
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    overflow-y: auto;
  }
  
  .sidebar h1 {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d2721;
    text-align: center;
    margin: 0;
  }
  
  .file-list {
    flex: 1;
    overflow-y: auto;
  }
  
  .file-item {
    background-color: rgba(255,255,255,0.1);
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    font-size: 0.85rem;
    word-break: break-word;
    color: #2d2721;
  }
  
  .chat-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    overflow: hidden;
  }
  
  .chat-header {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;
  }
  
  .chat-log {
    flex-grow: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
  }
  
  .chat-input-bar {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding-top: 1rem;
  }
  
  .chat-textarea {
    flex: 1;
    resize: none;
    overflow: hidden;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    line-height: 1.5;
    border: 1px solid #ccc;
    border-radius: 1.5rem;
    background-color: #d4bfae;
    color: #2d2721;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    min-height: 42px;
    max-height: 200px;
  }
  
  .chat-textarea:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.25);
    outline: none;
  }
  
  .chat-bubble {
    padding: 0.75rem 1rem;
    border-radius: 15px;
    max-width: 70%;
    word-wrap: break-word;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.25rem;
  }
  
  .chat-bubble.user {
    align-self: flex-end;
    background-color: #2d2721;
    color: #d4bfae;
    border-radius: 15px 15px 0 15px;
  }
  
  .chat-bubble.ai {
    align-self: flex-start;
    background-color: var(--ai-bubble-bg);
    color: #1e1e1e;
    border-radius: 15px 15px 15px 0;
  }
  
.chat-bubble.system {
  align-self: center;
  /* background-color: #fdecea; soft red */
  color: #611a15; /* deep red text */
  /* border: 1px solid #f5c6cb; */
  border-radius: 8px;
  padding: 12px 20px;
  margin: 12px 0;
  font-style: normal;
  font-weight: 500;
  text-align: center;
  /* box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); */
  max-width: 90%;
}


  
  .chat-timestamp {
    font-size: 0.75rem;
    color: #aaa;
    margin-top: 0.25rem;
  }
  
  .user .chat-timestamp {
    text-align: right;
  }
  
  .ai .chat-timestamp, .system .chat-timestamp {
    text-align: left;
  }
  
  .loading-indicator {
    align-self: flex-start;
    background-color: var(--ai-bubble-bg);
    color: #1e1e1e;
    padding: 0.75rem 1rem;
    border-radius: 15px 15px 15px 0;
    max-width: 70%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .typing-dots {
    display: flex;
    gap: 0.25rem;
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
    background-color: #666;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
  
  .button-group {
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    .layout {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      height: 200px;
    }
    
    nav {
      padding: 1rem 1.5rem;
    }
    
    .nav-links {
      gap: 1rem;
    }
  }
</style>

<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <a href="/calendar">Calendar</a>
    <a href="/agent" class="active">Agent</a>
    <a href="/notebooks">Notebooks</a>
  </div>
</nav>

<div class="layout">
  <aside class="sidebar">
    <h1>Upload Textbooks</h1>
    <div class="button-group">
      <button class="chat-btn" on:click={fileUpload}>📚 Upload</button>
      {#if uploadedFiles.length > 0}
        <button class="clear-btn" on:click={clearFiles}>🗑️ Clear Files</button>
      {/if}
    </div>
    
    <input
      bind:this={fileInput}
      type="file"
      multiple
      accept=".pdf,.txt,.doc,.docx"
      style="display: none;"
      on:change={handleFileChange}
    />
    
    {#if uploadedFiles.length > 0}
      <div class="file-list">
        <h3 style="color: #2d2721; font-size: 1rem;">Uploaded Files ({uploadedFiles.length}):</h3>
        {#each uploadedFiles as file}
          <div class="file-item">{file.name}</div>
        {/each}
      </div>
    {/if}
  </aside>

  <main class="chat-section">
    <header class="chat-header">
      <!-- <h1>Agent</h1>
      <p>Chat with your assistant. Upload textbooks to get more accurate, context-specific answers.</p> -->
    </header>

    <section class="chat-container">
      <div class="chat-log">
        {#each chatLog as message, index}
          <div class="chat-bubble {message.sender}">
            <div>{message.text}</div>
            <div class="chat-timestamp">{message.timestamp}</div>
          </div>
        {/each}
        
        {#if isLoading}
          <div class="loading-indicator">
            <span>AI is thinking</span>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        {/if}
      </div>

      <div class="chat-input-bar">
        <textarea
          class="chat-textarea"
          placeholder="Ask a question about your textbooks..."
          bind:value={userInput}
          rows="1"
          disabled={isLoading}
          on:input={autoResizeTextarea}
          on:keydown={handleKeydown}
        ></textarea>
        <button 
          class="send-btn" 
          on:click={sendMsg}
          disabled={isLoading || userInput.trim() === ""}
        >
          {isLoading ? "..." : "Send"}
        </button>
        <button class="clear-btn" on:click={clearChat}>Clear Chat</button>
      </div>
    </section>
  </main>
</div>