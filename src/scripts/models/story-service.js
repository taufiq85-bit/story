import CONFIG from "../config";

async function getAllStories() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message);
    }

    return data.listStory;
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw error;
  }
}

export default getAllStories;

export async function getStoryById(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `https://story-api.dicoding.dev/v1/stories/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  if (data.error) throw new Error(data.message);

  return data.story;
}

