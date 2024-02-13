document.addEventListener("DOMContentLoaded", () => {
  fetch("/friendship/my", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const friendListContainer = document.querySelector(".friend-list");
      if (data.friend)
        data.friend.forEach((friend) => {
          const listItem = document.createElement("li");
          const img = document.createElement("img");
          img.src = friend.profileUrl;
          img.alt = `${friend.name}`;
          img.width = 30;
          listItem.appendChild(img);

          const link = document.createElement("a");
          link.href = `/users/${friend.userId}`;
          link.textContent = friend.name;
          listItem.appendChild(link);

          friendListContainer.appendChild(listItem);
        });
    })
    .catch((error) => console.error("Error fetching friend list:", error));
});
