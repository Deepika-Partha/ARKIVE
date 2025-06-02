<script lang="ts">
  let email = '';
  let password = '';

  function handleLogin() {
    // Implement your login logic here
    // e.g., make an API call to your backend
    console.log('Logging in with:', { email, password });
    alert('Login form submitted (see console for data). Implement actual login logic.');
    // On successful login, you would navigate to another page:
    // import { goto } from '$app/navigation';
    // goto('/dashboard'); // or whatever your post-login page is
  }
</script>

<div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4">Welcome Back!</h2>
          <form on:submit|preventDefault={handleLogin}>
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" bind:value={email} required placeholder="name@example.com">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" bind:value={password} required placeholder="Enter your password">
            </div>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="rememberMe">
              <label class="form-check-label" for="rememberMe">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary w-100">Log In</button>
          </form>
          <p class="mt-3 text-center">
            <a href="/forgot-password">Forgot password?</a>
          </p>
          <hr>
          <p class="mt-3 text-center">
            Don't have an account? <a href="/registration">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>