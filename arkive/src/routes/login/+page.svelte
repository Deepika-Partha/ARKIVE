<script lang="ts">
  let email = '';
  let password = '';
  let loading = false;

  async function handleLogin() {
    loading = true;
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Login successful!');
        window.location.href = '/notebooks';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      loading = false;
    }
  }
</script>

<style>
  :global(body) {
    background: rgba(185,165,144,255);
  }

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

  /*login box*/
  .card {
    border-radius: 1.25rem;
  }

  /*email and password box*/
  .form-control {
    border-radius: 2rem;
    border: 1.5px solid #222;
    background: #fcf1e4; /* Very light orange */
    box-shadow: none;
    padding: 0.75rem 1.25rem;
    font-size: 1.15rem;
    color: #222;
    transition: border-color 0.2s;
  }

  .form-control:focus {
    border-color: #b97a56;
    outline: none;
    background: #f3dcc7;
  }

  .form-control::placeholder {
    color: #a0a0a0;
    opacity: 1;
    font-size: 1.1rem;
  }

  /*login button*/
  .btn-primary {
    background: #111;
    border-color: #111;
    color: #fff;
    border-radius: 2rem; 
    padding: 0.75rem 1.25rem;       
    font-size: 1.15rem;
    font-weight: 600;
    transition: background 0.2s, border-color 0.2s;
  }
  .btn-primary:hover, .btn-primary:focus {
    background: #333;
    border-color: #333;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    nav {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

<!-- Top Navigation Bar -->
<nav>
  <a href="/" class="logo">ARKIVE</a>
</nav>

<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Login</h2>
          <form on:submit|preventDefault={handleLogin}>
            <div class="mb-3">
              <input type="email" class="form-control" id="email" bind:value={email} required placeholder="Email">
            </div>
            <div class="mb-3">
              <input type="password" class="form-control" id="password" bind:value={password} required placeholder="Password">
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>
          <hr>
          <p class="mt-3 text-center">
            Don't have an account? <a href="/registration">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
