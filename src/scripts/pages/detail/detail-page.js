

import StoryModel from "../../models/story-model";

export default class DetailPage {
  async render() {
    return `<section class="container"><div id="story-detail"></div></section>`;
  }

  async afterRender() {
    const url = window.location.hash;
    const id = url.split("/stories/")[1];

    try {
      const story = await StoryModel.getStoryById(id);

      const detailEl = document.getElementById("story-detail");
      detailEl.innerHTML = `
        <h1>${story.name}</h1>
        <img src="${story.photoUrl}" alt="${story.name}" width="300" />
        <p>${story.description}</p>
        <p>Dibuat pada: ${new Date(story.createdAt).toLocaleString()}</p>
      `;
    } catch (err) {
      console.error("Gagal mengambil detail:", err);
    }
  }
   _renderList(stories) {
    this._listContainer.innerHTML = "";
    stories.forEach((story) => {
      this._listContainer.innerHTML += createStoryCard(story);
    });

    this._listContainer.querySelectorAll(".story-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        window.location.hash = `#/stories/${id}`;
      });

      card.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const id = card.getAttribute("data-id");
          window.location.hash = `#/stories/${id}`;
        }
      });
    });
  }
}