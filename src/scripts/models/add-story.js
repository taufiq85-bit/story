import CONFIG from "../config";

async function addStory(description, imageBlob, lat = null, lon = null, token) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", imageBlob, "photo.jpg");

  if (lat !== null && lon !== null) {
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to submit story");
  }

  return await response.json();
}

export default addStory