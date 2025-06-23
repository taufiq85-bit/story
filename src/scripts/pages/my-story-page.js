// src/scripts/pages/my-story-page.js

import MyStoryDb from '../utils/db';

export default class MyStoryPage {
  async render() {
    return `
      <section class="container">
        <h1>My Stories</h1>
        <p>Cerita yang Anda simpan di perangkat ini.</p>
        <div id="my-stories-container" class="story-list" style="margin-top: 1rem;">
          <p>Memuat cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storiesContainer = document.getElementById('my-stories-container');
    const stories = await MyStoryDb.getAllStories();

    if (stories.length === 0) {
      storiesContainer.innerHTML = '<p>Anda belum memiliki cerita yang disimpan.</p>';
      return;
    }

    storiesContainer.innerHTML = '';
    stories.forEach((story) => {
      const storyElement = document.createElement('li');
      storyElement.classList.add('story-card');
      storyElement.style.listStyle = 'none';

      const photoUrl = URL.createObjectURL(story.photo);
      
      let locationInfo = '';
      if (story.lat && story.lon) {
        locationInfo = `<small>Lokasi: ${story.lat.toFixed(5)}, ${story.lon.toFixed(5)}</small><br/>`;
      }

      storyElement.innerHTML = `
        <img src="${photoUrl}" alt="Story Image" style="width: 100%; border-radius: 8px;" />
        <p style="margin-top: 0.5rem;">${story.description}</p>
        ${locationInfo}
        <small>Disimpan pada: ${new Date(story.createdAt).toLocaleString()}</small>
        <button class="delete-button" data-id="${story.id}" style="display: block; width: 100%; margin-top: 1rem; background: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 6px; cursor: pointer;">Hapus</button>
      `;

      storyElement.querySelector('.delete-button').addEventListener('click', async (event) => {
        const storyId = event.target.dataset.id;
        if (confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
          await MyStoryDb.deleteStory(storyId);
          alert('Cerita berhasil dihapus.');
          this.afterRender();
        }
      });
      
      storiesContainer.appendChild(storyElement);
    });
  }
}