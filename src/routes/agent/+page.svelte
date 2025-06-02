<style>
	nav {
    background-color: hsla(30.73, 22.65%, 64.51%, 1);
    padding: 2rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
	.nav-links {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }
  .nav-links a {
    text-decoration: none;
    color: #1e1e1e;
    font-weight: 500;
  }
	.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e1e1e;
    text-decoration: none;
  }
	.hero{
		display:flex;
		flex-direction:row;
		min-height:100vh;
    background-color: hsla(30.73, 22.65%, 64.51%, 1);
	}
	.upload{
		flex:1;
		display:flex;
		flex-direction:column;
		justify-content:flex-start;
		white-space:nowrap;
		align-items:center;
		padding:4rem;
		gap:1rem;
		color:black;
	}
	.upload h1{
		font-size:2rem;
		font-weight:bold;
		line-height:1.2;
		margin-bottom:1rem;
	}
	.agent{
		flex:1;
		display:flex;
		flex-direction:column;
		align-items:center;
		padding:4rem;
		gap:.25rem;
		color:black;
	}
	.agent h1{
		font-size:2rem;
		font-weight:bold;
		line-height:1.2;
		margin-bottom:1rem;
	}
	.agent p{
		text-align:center;
	}
	  .login-btn {
    padding: 0.4rem 1rem;
    border: 1px solid #1e1e1e;
    border-radius: 20px;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    background-color: rgb(0, 0, 0);
    color: #d4bfae;
  }
  .login-btn:hover {
    color: #1e1e1e;
    background-color: hsla(30.73, 22.65%, 64.51%, 1); /* soft beige/tan text */
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
    padding: 0.75rem 1rem;
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
  }
  .send-btn:hover {
	  background-color: hsla(30.73, 22.65%, 64.51%, 1);
	  color: #000000; 
	  border: 2px solid #000000;
  }
	input[type="text"] {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 2px solid #2d2721;
    background-color: #9f8a76;
    color: #1e1e1e;
    font-size: 1rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
  input[type="text"]:focus {
    border-color: #2d2721;
    box-shadow: 0 0 5px rgba(45, 39, 33, 0.5);
    outline: none;
  }
</style>
<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <a href="/calendar">Calendar</a>
    <a href="/agent">Agent</a>
    <a href="/notebooks">Notebooks</a>
    <button class="login-btn">Login</button>
  </div>
</nav>

<div class="hero">
	<div class="upload">
    <h1>Upload Textbooks</h1>
      <p><button class="chat-btn">&#x2B06;</button></p>
	</div>
	<div class="agent">
      <h1>Agent</h1>
        <p>Chat with your assistant, We'll answer your question based off information found in the uploaded documents.</p>
      <footer class="agent-text">
        <input
          type="text"
          placeholder="Ask a question..."
        />
					<a href="/chat"><button class="send-btn">Send</button></a>
      </footer>
	</div>
</div>