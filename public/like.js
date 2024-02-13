document.querySelectorAll(".like-button").forEach((button) => {
  button.addEventListener("click", async (event) => {
    const postId = event.target.getAttribute("data-post-id");
    try {
      const response = await fetch(`/post/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });
      if (response.ok) {
        const { updatedPost } = await response.json();
        event.target.innerText = `좋아요 ${updatedPost.like}`;
      } else {
        alert("이미 좋아요를 눌렀습니다.");
      }
    } catch (error) {
      console.error("좋아요 중 에러 발생:", error);
    }
  });
});

document.querySelectorAll(".comment-like-button").forEach((button) => {
  button.addEventListener("click", async (event) => {
    const commentId = event.target.getAttribute("data-comment-id");
    try {
      const response = await fetch(`/comment/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });
      if (response.ok) {
        const { updatedComment } = await response.json();
        event.target.innerText = `좋아요 ${updatedComment.clike}`;
      } else {
        alert("이미 좋아요를 눌렀습니다.");
      }
    } catch (error) {
      console.error("좋아요 중 에러 발생:", error);
    }
  });
});
