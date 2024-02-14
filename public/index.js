document.addEventListener("DOMContentLoaded", function () {
  const deleteForms = document.querySelectorAll(".delete-form");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fetch(this.action, {
        method: "DELETE",
        body: new URLSearchParams(new FormData(this)),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "댓글 삭제에 성공하였습니다.") {
            location.reload();
          } else {
            alert("댓글 삭제에 실패하였습니다.");
          }
        });
    });
  });

  const commentForms = document.querySelectorAll(".comment-form");
  commentForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fetch(this.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(this)),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "댓글 생성에 성공하였습니다.") {
            location.reload();
          } else {
            alert("댓글 생성에 실패하였습니다.");
          }
        });
    });
  });
});

window.onload = function () {
  var logoutButton = document.getElementById("logoutButton");
  logoutButton.onclick = function () {
    window.location.href = "/logout";
  };
};

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
          img.src = users.profileUrl;
          img.alt = `${friend.name}`;
          img.width = 30;
          listItem.appendChild(img);
          listItem.innerText += friend.name;
          friendListContainer.appendChild(listItem);
        });
    })
    .catch((error) => console.error("Error fetching friend list:", error));
});

const putpost = document.getElementById("putpost");
function postedit(postId, title, content) {
  document.getElementById("edit-post-form").action = `/post/${postId}`;
  document.getElementById("edit-title").value = title;
  document.getElementById("edit-content").value = content;
  putpost.style.display = "flex";
}

function postputcom() {
  putpost.style.display = "none";
  window.location.href = "/mypage";
}

const putcomment = document.getElementById("putcomment");
function commentedit(postId, commentId, content) {
  document.getElementById(
    "edit-comment-form"
  ).action = `/post/${postId}/comment/${commentId}`;
  document.getElementById("edit-content").value = content;
  putcomment.style.display = "flex";
}

function commentputcom() {
  putcomment.style.display = "none";
  window.location.reload();
}
