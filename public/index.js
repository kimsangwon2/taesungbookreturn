document.addEventListener("DOMContentLoaded", function () {
  const deleteForms = document.querySelectorAll(".delete-form");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      fetch(this.action, {
        method: "POST",
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
