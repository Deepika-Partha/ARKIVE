<script lang="ts">
  import '../app.css';
  export let data;
  let loggedIn = data.loggedIn;

  async function handleLogout() {
    await fetch('http://localhost:4000/api/logout', { method: 'POST', credentials: 'include' });
    loggedIn = false;
    window.location.href = '/';
  }
</script>

<!-- main color hex: hsla(30.73, 22.65%, 64.51%, 1); -->
<style>
  nav {
    background: rgba(212, 191, 174, 0.95);
    backdrop-filter: blur(20px);
    padding: 1.5rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
  }

  .logo {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    text-decoration: none;
    letter-spacing: -0.5px;
    transition: all 0.3s ease;
  }

  .logo:hover {
    opacity: 0.8;
    transform: translateY(-1px);
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
    font-size: 0.95rem;
    transition: all 0.3s ease;
    padding: 0.75rem 1.25rem;
    border-radius: 25px;
    position: relative;
    border-bottom: none;
  }

  .nav-links a:hover {
    color: var(--primary-color);
    background-color: var(--hover-color);
    transform: translateY(-2px);
  }

  .login-btn a{
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

  .login-btn:hover a{
    color: #1e1e1e;
    background-color: hsla(30.73, 22.65%, 64.51%, 1); /* soft beige/tan text */
  }

  .hero {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
    background-color: hsla(30.73, 22.65%, 64.51%, 1);
  }

  .left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem;
    color: #1e1e1e;
  }

  .left h1 {
    font-size: 3rem;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  .left p {
    font-size: 1.1rem;
    max-width: 30rem;
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 50px; /* right side padding (marginal) */
    box-sizing: border-box;
  }

  .right img {
    height: 95%;  /* Adjusting the height to make the image bigger */
    width: 100%;  /* Maintain aspect ratio */
    object-fit: cover;
    object-position: center;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    .hero {
      flex-direction: column;
    }

    .right {
      height: 50vh;
      padding-right: 0;
    }

    nav {
      flex-direction: column;
      align-items: flex-start;
    }

    .nav-links {
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }
  }

    .get-started-btn {
    margin-top: 2rem;
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
    width: 190px;
    }

.get-started-btn:hover {
  background-color: hsla(30.73, 22.65%, 64.51%, 1);
  color: #000000; /* black text */
  border: 1px solid #000000; /* properly defined border */
}


</style>
<!-- Weird logic but a href = "#" is just to have the formatting work for both, and |preventDefault is to have it just do the logout logic -->
<!-- Top Navigation Bar -->
<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <a href="/calendar">Calendar</a>
    <a href="/agent">Agent</a>
    <a href="/notebooks">Notebooks</a>
    {#if loggedIn}
      <div class="login-btn"><a href="#" on:click|preventDefault={handleLogout}>Logout</a></div> 
    {:else}
      <div class="login-btn"><a href="/login">Login</a></div>
    {/if}
  </div>
</nav>

<!-- Hero Section -->
<div class="hero">
  <div class="left">
    <h1>Organizing<br />Education,<br />Digitally</h1>
    <p>
      Step into a space where academic life is streamlined and stress-free. 
      Arkive brings all your textbooks, notes, and planners into one digital hub—so you can focus more on learning and less on managing.
    </p>
    <a class="get-started-btn" href="/registration">GET STARTED</a>
  </div>
  <div class="right">
    <img src="/notebook.jpg" alt="Notebook on table" />
  </div>
</div>



