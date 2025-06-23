export default class RegisterPage {
  async render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h2 class="auth-card__title">Register</h2>
          <p class="auth-card__subtitle">Buat akun baru Anda</p>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="button button-primary">Register</button>
          </form>

          <div class="auth-card__footer">
            Sudah punya akun? <a href="#/login">Login di sini</a>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const response = await fetch(
            "https://story-api.dicoding.dev/v1/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, password }),
            }
          );

          const result = await response.json();

          if (!result.error) {
            alert("Registrasi berhasil. Silakan login.");
            window.location.hash = "#/login";
          } else {
            alert(result.message);
          }
        } catch (error) {
          console.error("Register error:", error);
          alert("Terjadi kesalahan saat registrasi.");
        }
      });
  }
}