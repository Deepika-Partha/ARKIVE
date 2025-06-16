<!-- REGISTRATION PAGE -->

<script lang="ts">
  let email = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;

  async function handleRegister() {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    loading = true;
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! You can now log in.');
        window.location.href = '/login';
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      loading = false;
    }
  }
</script>

<style>
  nav {
    background-color: hsla(30.73, 22.65%, 64.51%, 1);
    padding: 2rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1e1e1e;
    text-decoration: none;
  }
  @media (max-width: 768px) {

    nav {
      flex-direction: column;
      align-items: flex-start;
  }
}

</style>

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

<!-- Top Navigation Bar -->
<nav>
  <a href="/" class="logo">ARKIVE</a>
  <div class="nav-links">
    <a href="/calendar">Calendar</a>
    <a href="/agent">Agent</a>
    <a href="/notebooks">Notebooks</a>
    <!-- <button class="login-btn">Login</button> -->
    <div class="login-btn">
      <a href="/login">Login</a>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<nav>
  <a href="/" class="logo">ARKIVE</a>
</nav>

<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Create Account</h2>
          <form on:submit|preventDefault={handleRegister}>
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" bind:value={email} required placeholder="name@example.com">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" bind:value={password} required minlength="5" placeholder="Choose a password (min. 8 characters)">
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input type="password" class="form-control" id="confirmPassword" bind:value={confirmPassword} required placeholder="Re-enter your password">
            </div>
            <button type="submit" class="btn btn-primary w-100">Register</button>
          </form>
          <p class="mt-3 text-center">
            Already have an account? <a href="/login">Log In</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>



