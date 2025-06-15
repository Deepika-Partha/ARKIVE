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

<!-- Top Navigation Bar -->
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
