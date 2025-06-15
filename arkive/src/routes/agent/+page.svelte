<script>
	let fileInput;
	let chatLog = [];
	let userInput = "";
	let showChat = false;
	
	function fileUpload(){
		fileInput.click();
	}
	function handleFileChange(event){
		const files = event.target.files;
	}
	function sendMsg(){
		if (userInput.trim() !== ""){
			const now = new Date();
			const timestamp = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
			
			chatLog = [...chatLog, {sender: "user", text: userInput, timestamp: timestamp}];
			userInput = "";
			showChat = true;
		}
		setTimeout(() => {
			const chatLogDiv = document.querySelector(".chat-log"); 
			if (chatLogDiv){
				chatLogDiv.scrollTop = chatLogDiv.scrollHeight;
			}
		},0);
	}
	function clearChat(){
		chatLog = [];
		showChat = false;
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
	}
	nav {
    background-color: var(--bg-color);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
		position : relative;
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
  .chat-btn {
    margin-top: 0;
    padding: 1rem 2rem;
    background-color: #2d2721; /* black */
    color: #d4bfae; /* soft beige/tan text (highlighted hover) */
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 90px;
  }
  .chat-btn:hover {
	  background-color: hsla(30.73, 22.65%, 64.51%, 1);
	  color: #000000; 
	  border: 3px solid #000000;
  }
	.send-btn {
    padding: 0.75rem 1.5rem;
    background-color: #2d2721; /* black */
    color: #d4bfae; /* soft beige/tan text (highlighted hover) */
    border: none;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 90px;
		flex: 1;
		max-width: 120px;
    max-height: 60px;

  }
  .send-btn:hover {
	  background-color: hsla(30.73, 22.65%, 64.51%, 1);
	  color: #000000; 
	  border: 2px solid #000000;
  }
	.layout {
	  display: flex;
	  height: calc(100vh - 80px); /* subtract nav height */
	  background-color: var(--bg-color);
	}
	.sidebar {
	  width: 180px;
	  background-color: #927c66;
	  border-right: 1px solid var(--hover-color);
	  padding: 2rem 1rem;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  gap: 1.5rem;
	}
	.sidebar h1 {
	  font-size: 1.2rem;
	  font-weight: bold;
	  color: #ccc;
	  text-align: center;
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
	  background-color: #fff;
	  color: #1e1e1e;
	  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
	  min-height: 44px;
	  max-height: 200px;
	}
	.chat-textarea:focus {
	  border-color: var(--accent-color);
	  box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.25);
	  outline: none;
	}
	.chat-bubble {
	  align-self: flex-end;
	  background-color: #2d2721;
	  color: #d4bfae;
	  padding: 0.5rem 1rem;
	  border-radius: 15px 15px 0 15px;
	  max-width: 70%;
	  word-wrap: break-word;
	  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
	.chat-timestamp {
	  font-size: 0.75rem;
	  color: #aaa;
	  margin-top: 0.25rem;
	  text-align: right;
	}
	.chat-textarea {
	  width: 100%;
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
	  border-color: --border-color;
	  box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.25);
	  outline: none;
	}
	.clear-btn {
		margin-top: 0.5rem;
		padding: 0.75rem 1rem;
		width: 90px;  
		background-color: #2d2721;
		color: #d4bfae;
		border: none;
		border-radius: 20px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.3s ease;
		max-width: 120px;
		flex:1;
	}
	.clear-btn:hover {
		background-color: hsla(30.73, 22.65%, 64.51%, 1);
		color: #000000;
		border: 2px solid #000000;
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
    <p><button class="chat-btn" on:click={fileUpload}>&#x2B06;</button></p>
    <input
      bind:this={fileInput}
      type="file"
      multiple
      style="display: none;"
      on:change={handleFileChange}
    />
  </aside>

  <main class="chat-section">
    <header class="chat-header">
      <h1>Agent</h1>
      <p>Chat with your assistant. We'll answer based on the uploaded textbooks.</p>
    </header>

    <section class="chat-container">
      <div class="chat-log">
        {#each chatLog as message, index(index)}
          <div class="chat-bubble">
            <div>{message.text}</div>
            <div class="chat-timestamp">{message.timestamp}</div>
          </div>
        {/each}
      </div>

      <div class="chat-input-bar">
        <textarea
          class="chat-textarea"
          placeholder="Ask a question..."
          bind:value={userInput}
          rows="1"
          on:input={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          on:keydown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMsg();
            }
          }}
        ></textarea>
        <button class="send-btn" on:click={sendMsg}>Send</button>
        <button class="clear-btn" on:click={clearChat}>Clear</button>
      </div>
    </section>
  </main>
</div>