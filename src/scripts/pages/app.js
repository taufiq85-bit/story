// src/scripts/pages/app.js

import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import PushNotification from "../utils/push-notification";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #subscribeButton = null;
  #installButton = null;
  #logoutMenuItem = null;
  #logoutButton = null;
  #installPrompt = null;
  _activePage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#subscribeButton = document.querySelector('#subscribe-button');
    this.#installButton = document.querySelector('#install-button');
    this.#logoutMenuItem = document.querySelector('#logout-menu-item');
    this.#logoutButton = document.querySelector('#logout-button');

    this.#setupDrawer();
    this.#setupPushSubscription();
    this.#setupInstallButton();
    this.#setupLogoutButton();
  }

  #setupLogoutButton() {
    this.#logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
      this.#updateHeaderState();
      window.location.hash = '#/login';
      alert('Anda telah berhasil logout.');
    });
  }

  #setupInstallButton() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.#installPrompt = event;
      this.#installButton.style.display = 'block';
    });

    this.#installButton.addEventListener('click', async () => {
      if (!this.#installPrompt) return;
      await this.#installPrompt.prompt();
      this.#installButton.style.display = 'none';
      this.#installPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
      this.#installPrompt = null;
    });
  }

  // === FUNGSI YANG DIPERBAIKI ===
  async #setupPushSubscription() {
    await PushNotification.init();

    this.#subscribeButton.addEventListener('click', async () => {
      const state = await PushNotification.getSubscriptionState();
      
      // Jika sudah subscribe, jalankan unsubscribe. Jika belum, jalankan subscribe.
      if (state.isSubscribed) {
        await PushNotification.unsubscribeUser();
      } else {
        await PushNotification.subscribeUser();
      }

      // Perbarui tampilan tombol setelah aksi selesai
      this.#updateHeaderState();
    });
  }

  // === METODE YANG DISEMPURNAKAN UNTUK MENGATUR SEMUA TOMBOL HEADER ===
  async #updateHeaderState() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        this.#subscribeButton.style.display = 'none';
        this.#installButton.style.display = 'none';
        this.#logoutMenuItem.style.display = 'none';
        return;
    }

    this.#logoutMenuItem.style.display = 'list-item';

    const { isSubscribed, permission } = await PushNotification.getSubscriptionState();

    this.#subscribeButton.style.display = 'none';
    this.#subscribeButton.disabled = false;

    if (permission === 'granted') {
      this.#subscribeButton.style.display = 'block';
      if (isSubscribed) {
        this.#subscribeButton.textContent = 'Unsubscribe';
        this.#subscribeButton.style.backgroundColor = 'var(--danger-color)';
        this.#subscribeButton.disabled = false; // <-- PERBAIKAN: tombol tetap bisa diklik
      } else {
        this.#subscribeButton.textContent = 'Subscribe Notifikasi';
        this.#subscribeButton.style.backgroundColor = 'var(--accent-color)';
      }
    } else if (permission === 'denied') {
      this.#subscribeButton.style.display = 'block';
      this.#subscribeButton.textContent = 'Notifikasi Diblokir';
      this.#subscribeButton.disabled = true;
    } else {
      this.#subscribeButton.style.display = 'block';
      this.#subscribeButton.textContent = 'Subscribe Notifikasi';
      this.#subscribeButton.style.backgroundColor = 'var(--accent-color)';
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
      if (event.target.closest('.nav-list a, #logout-button')) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  async renderPage() {
    const currentPath = window.location.hash || '#/';
    const authPages = ['#/login', '#/register'];
    if (authPages.includes(currentPath)) {
      document.body.classList.add('auth-page');
    } else {
      document.body.classList.remove('auth-page');
    }

    const url = getActiveRoute();
    const page = routes[url];

    const token = localStorage.getItem("token");
    if (url !== "/login" && url !== "/register" && !token) {
      window.location.hash = "#/login";
      return;
    }

    if (this._activePage?.destroy) {
      this._activePage.destroy();
    }
    this._activePage = page;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#updateHeaderState();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.#updateHeaderState();
    }
  }
}

export default App;
