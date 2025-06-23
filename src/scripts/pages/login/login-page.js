// src/scripts/pages/login/login-page.js

export default class LoginPage {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-card__title">Login</h1>
          <p class="auth-card__subtitle">Silakan masuk untuk melanjutkan</p>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="button button-primary">Login</button>
          </form>

          <div class="auth-card__footer">
            Belum punya akun? <a href="#/register">Register di sini</a>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("https://story-api.dicoding.dev/v1/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!result.error) {
          localStorage.setItem("token", result.loginResult.token);
          localStorage.setItem("name", result.loginResult.name);
          localStorage.setItem("userId", result.loginResult.userId);

          if (document.startViewTransition) {
            document.startViewTransition(() => {
              window.location.href = "/";
            });
          } else {
            window.location.href = "/";
          }
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Terjadi kesalahan saat login.");
      }
    });
  }
}