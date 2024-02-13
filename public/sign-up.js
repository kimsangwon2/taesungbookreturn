function setThumbnail(event) {
  var container = document.querySelector("div#image_container");

  if (container.hasChildNodes()) {
    alert(
      "이미 업로드된 이미지가 있습니다. 새 이미지를 업로드하려면 먼저 기존 이미지를 삭제하세요."
    );
    return;
  }

  var reader = new FileReader();

  reader.onload = function (event) {
    var img = document.createElement("img");
    img.setAttribute("src", event.target.result);

    img.setAttribute("width", "100%");
    document.querySelector("div#image_container").appendChild(img);

    document.getElementById("deleteButton").style.display = "block";
  };

  reader.readAsDataURL(event.target.files[0]);
}

function deleteImage() {
  var container = document.querySelector("div#image_container");
  container.innerHTML = "";

  document.getElementById("deleteButton").style.display = "none";

  document.getElementById("profileimage").value = "";
}

document.getElementById("deleteButton").addEventListener("click", deleteImage);
