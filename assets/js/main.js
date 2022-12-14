const closeNav = () => {
  document.getElementById("menu-control").checked = false;
};

window.addEventListener("load", () => {
  document.getElementsByClassName("loading")[0].remove();
  loadImages();
});

const loadImages = () => {
  const images = document.querySelectorAll("img[_src]");
  for (const img of images) {
    img.src = img.attributes._src.value;
  }
};
