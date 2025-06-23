

import L from "leaflet";
import StoryModel from '../../models/story-model'; 
import MyStoryDb from '../../utils/db';

export default class AddPage {
  constructor() {
    this.mediaStream = null;
  }

  async render() {
    return `
      <section class="container" id="add-story-container">
        <h1>Tambah Cerita Baru</h1>
        <form id="storyForm">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea name="description" id="description" required></textarea>
          </div>
          <div class="form-group">
            <label>Ambil Foto</label>
            <div style="display:flex; align-items:center; gap:1rem;">
              <video id="camera" autoplay style="width:180px; height:120px; border-radius:8px; background:#eee;"></video>
              <button id="captureBtn" type="button" class="button">Ambil Foto</button>
              <img id="photoPreview" alt="hasil foto" style="display:none; width:120px; height:auto; border-radius:8px;" />
            </div>
          </div>
          <div class="form-group">
            <label>Pilih Lokasi (Opsional)</label>
            <div id="map" style="height: 250px; width: 100%; border-radius: 8px;"></div>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button id="submitBtn" type="button" class="button" style="flex: 1; background-color: var(--primary-color); color: white;">Kirim ke Server</button>
            <button id="saveBtn" type="button" class="button" style="flex: 1; background-color: #28a745; color: white;">Simpan di Perangkat</button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const video = document.getElementById("camera");
    const captureBtn = document.getElementById("captureBtn");
    const submitBtn = document.getElementById("submitBtn");
    const saveBtn = document.getElementById("saveBtn");
    const descriptionInput = document.getElementById("description");
    const photoPreview = document.getElementById("photoPreview");

    let photoBlob = null;
    let selectedLat = null;
    let selectedLon = null;
    let marker = null;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = this.mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
    }

    captureBtn.addEventListener("click", () => {
      const MAX_WIDTH = 800;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext('2d');
      const ratio = video.videoWidth / video.videoHeight;
      canvas.width = MAX_WIDTH;
      canvas.height = MAX_WIDTH / ratio;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          photoBlob = blob;
          photoPreview.src = URL.createObjectURL(blob);
          photoPreview.style.display = "block";
          if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
          }
        }
      }, "image/jpeg", 0.8);
    });

    const map = L.map("map").setView([-6.2, 106.8], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    map.on("click", (e) => {
      selectedLat = e.latlng.lat;
      selectedLon = e.latlng.lng;
      if (marker) {
        marker.setLatLng([selectedLat, selectedLon]);
      } else {
        marker = L.marker([selectedLat, selectedLon]).addTo(map);
      }
    });
    
    // === LOGIKA BARU UNTUK KIRIM KE SERVER ===
    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const desc = descriptionInput.value;

        if (!photoBlob || !desc) {
            alert("Isi deskripsi dan ambil foto terlebih dahulu.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";

        try {
            const result = await StoryModel.addStory({
                description: desc,
                photo: photoBlob,
                lat: selectedLat,
                lon: selectedLon,
            });
            alert("Cerita berhasil dikirim ke server!");
            window.location.hash = '#/'; // Arahkan ke halaman utama
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim cerita ke server: " + (err.message || err));
            submitBtn.disabled = false;
            submitBtn.textContent = "Kirim ke Server";
        }
    });

    saveBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const desc = descriptionInput.value;
        if (!photoBlob || !desc) {
            alert("Isi deskripsi dan ambil foto terlebih dahulu.");
            return;
        }
        try {
            const story = {
                description: desc,
                photo: photoBlob,
                lat: selectedLat,
                lon: selectedLon,
                createdAt: new Date().toISOString(),
            };
            await MyStoryDb.addStory(story);
            alert("Cerita berhasil disimpan di perangkat Anda!");
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan cerita: " + (err.message || err));
        }
    });
  }

  destroy() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}