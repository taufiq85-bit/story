// src/scripts/presenters/story-presenter.js

class StoryPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async displayStories() {
    try {
      // Perintahkan View untuk menampilkan loading
      this.#view.showLoading();

      // Ambil data dari Model
      const stories = await this.#model.getAllStories();

      // Perintahkan View untuk menampilkan cerita dan peta
      this.#view.renderStories(stories);
      this.#view.renderMap(stories);

    } catch (error) {
      console.error(error);
      // Perintahkan View untuk menampilkan pesan error
      this.#view.renderError(error.message);
    } finally {
      // Perintahkan View untuk menyembunyikan loading
      this.#view.hideLoading();
    }
  }
}

export default StoryPresenter;