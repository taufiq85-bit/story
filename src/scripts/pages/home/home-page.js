// src/scripts/pages/home-page.js

import StoryPresenter from "../../presenters/story-presenter";
import StoryModel from "../../models/story-model"; // Impor Model
import createStoryCard from "../../components/story-card";

export default class HomePage {
  #presenter;

  constructor() {
    // Buat instance dari Model dan Presenter di sini
    this.#presenter = new StoryPresenter({
      view: this,
      model: StoryModel,
    });
  }

  async render() {
    return `
      <section class="container">
        <h1>Home Page</h1>
        <div id="loading-indicator" style="display: none;">Loading...</div>
        <div class="detail-location">
          <h2>Lokasi Cerita</h2>
          <div id="detail-map" style="height: 400px; width: 100%; border-radius: 8px; margin-top: 1rem;"></div>
        </div>
        <h2>Data Cerita</h2>
        <ul id="story-list" class="story-list"></ul>
      </section>
    `;
  }

  async afterRender() {
    // Panggil Presenter untuk memulai logika
    await this.#presenter.displayStories();
  }

  // --- Metode-metode ini adalah "layanan" untuk Presenter ---

  showLoading() {
    document.getElementById('loading-indicator').style.display = 'block';
  }

  hideLoading() {
    document.getElementById('loading-indicator').style.display = 'none';
  }

  renderStories(stories) {
    const container = document.getElementById("story-list");
    container.innerHTML = "";
    if (stories.length === 0) {
      container.innerHTML = "<p>Belum ada cerita yang ditambahkan.</p>";
      return;
    }

    stories.forEach((story) => {
      const storyElement = document.createElement('div');
      storyElement.innerHTML = createStoryCard(story);
      const card = storyElement.firstElementChild;
      card.addEventListener("click", () => window.location.hash = `#/stories/${story.id}`);
      card.addEventListener("keypress", (e) => {
        if (e.key === "Enter") window.location.hash = `#/stories/${story.id}`;
      });
      container.appendChild(card);
    });
  }

  renderMap(stories) {
    const mapContainerId = "detail-map";
    const map = L.map(mapContainerId).setView([-2.5, 118.0], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        L.marker([story.lat, story.lon]).addTo(map).bindPopup(`
          <strong>${story.name}</strong><br>
          <img src="${story.photoUrl}" alt="${story.name}" width="100" />
        `);
      }
    });
  }

  renderError(message) {
    const storyContainer = document.getElementById("story-list");
    storyContainer.innerHTML = `<p class="error-message">Gagal memuat cerita: ${message}</p>`;
  }
}