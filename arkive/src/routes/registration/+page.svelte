<script lang="ts">
  let email = '';
  let password = '';
  let confirmPassword = '';

  function handleRegister() {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Implement your registration logic here
    // e.g., make an API call to your backend
    console.log('Registering with:', { email, password });
    alert('Registration form submitted (see console for data). Implement actual registration logic.');
  }
</script>

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
              <input type="password" class="form-control" id="password" bind:value={password} required minlength="8" placeholder="Choose a password (min. 8 characters)">
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