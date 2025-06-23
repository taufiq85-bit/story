const addStory = async ({ description, photo, lat, lon }) => {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== undefined && lat !== null) {
    formData.append("lat", Number(lat));
  }
  if (lon !== undefined && lon !== null) {
    formData.append("lon", Number(lon));
  }

  const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal menambah cerita");
  }

  return response.json();
};

const getAllStories = async () => {
  const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal mengambil data cerita");
  }

  const data = await response.json();
  return data.listStory;
};

const getStoryById = async (id) => {
  const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal mengambil detail cerita");
  }

  const data = await response.json();
  return data.story;
};

const StoryModel = {
  getAllStories,
  addStory,
  getStoryById,
};

export default StoryModel;