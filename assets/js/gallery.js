const nextImage = () => {
  clearInterval(photoInterval);
  const gallery = document
    .getElementById("galeria")
    .getElementsByClassName("gallery")[0];
  const photos = gallery.getElementsByClassName("photos")[0];
  const photosAmount = photos.childElementCount;
  const photoWidth = photos.children[0].getBoundingClientRect().width;
  const firstPhoto = photos.children[0];
  const currentShift =
    Number.parseInt(
      firstPhoto.parentElement.style.transform.replace(/\D/g, "")
    ) || 0;
  let nextShift = currentShift + photoWidth;
  if (nextShift > photoWidth * (photosAmount - 1)) {
    nextShift = 0;
  }
  firstPhoto.parentElement.style.transform = `translateX(-${nextShift}px)`;

  photoInterval = startInterval();
};

const prevImage = () => {
  clearInterval(photoInterval);
  const gallery = document
    .getElementById("galeria")
    .getElementsByClassName("gallery")[0];
  const photos = gallery.getElementsByClassName("photos")[0];
  const photosAmount = photos.childElementCount;
  const photoWidth = photos.children[0].getBoundingClientRect().width;
  const firstPhoto = photos.children[0];
  const currentShift =
    Number.parseInt(
      firstPhoto.parentElement.style.transform.replace(/\D/g, "")
    ) || 0;
  let nextShift = currentShift - photoWidth;
  if (nextShift < 0) {
    nextShift = photoWidth * (photosAmount - 1);
  }
  firstPhoto.parentElement.style.transform = `translateX(-${nextShift}px)`;

  photoInterval = startInterval();
};

const startInterval = () => {
  return setInterval(() => {
    nextImage();
  }, 3000);
};

let photoInterval = startInterval();
