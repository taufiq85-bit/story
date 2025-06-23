const createStoryCard = (story) => {
  return `
    <li class="story-card" data-id="${
      story.id
    }" tabindex="0" style="cursor: pointer;">
      <strong>${story.name}</strong><br>
      <img src="${story.photoUrl}" alt="${story.name}" width="300" />
      <p>${story.description}</p>
      <p>${new Date(story.createdAt).toLocaleString()}</p>
      <hr/>
    </li>
  `;
};

export default createStoryCard;
