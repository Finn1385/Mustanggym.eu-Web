let photoInterval = null;
let canShift = true;

const nextImage = () => {
  const gallery = document
    .getElementById("galeria")
    .getElementsByClassName("gallery")[0];
  const photos = gallery.getElementsByClassName("photos")[0];
  const photosAmount = photos.childElementCount;
  const photoWidth = photos.children[0].getBoundingClientRect().width;
  const firstPhoto = photos.children[0];
  const currentShift =
    Number.parseFloat(
      firstPhoto.parentElement.style.transform.replace(/[^0-9.]/g, "")
    ) || 0;
  let nextShift = currentShift + photoWidth;
  if (nextShift > photoWidth * (photosAmount - 1)) {
    nextShift = 0;
  }
  firstPhoto.parentElement.style.transform = `translateX(-${nextShift}px)`;
};

const prevImage = () => {
  const gallery = document
    .getElementById("galeria")
    .getElementsByClassName("gallery")[0];
  const photos = gallery.getElementsByClassName("photos")[0];
  const photosAmount = photos.childElementCount;
  const photoWidth = Number.parseInt(
    photos.children[0].getBoundingClientRect().width
  );
  const firstPhoto = photos.children[0];
  const currentShift =
    Number.parseInt(
      firstPhoto.parentElement.style.transform.replace(/[^0-9.]/g, "")
    ) || 0;
  let nextShift = currentShift - photoWidth;
  if (nextShift < 0) {
    nextShift = photoWidth * (photosAmount - 1);
  }
  firstPhoto.parentElement.style.transform = `translateX(-${nextShift}px)`;
};

const startInterval = () => {
  return setInterval(() => {
    nextImage();
  }, 3000);
};

document
  .getElementById("galeria")
  .getElementsByClassName("gallery")[0]
  .addEventListener("mouseover", () => {
    clearInterval(photoInterval);
  });

document
  .getElementById("galeria")
  .getElementsByClassName("gallery")[0]
  .addEventListener("mouseleave", () => {
    if (document.getElementById("nasi-klienti")) {
      photoInterval = startClientInterval();
    } else photoInterval = startInterval();
  });

const prevClient = () => {
  if (!canShift) return;
  prevImage();
  const userWrapper = document
    .getElementById("galeria")
    .getElementsByClassName("user-wrapper")[0];
  const profilePics = userWrapper.getElementsByClassName("pp-photos")[0];
  const ppAmount = profilePics.childElementCount;
  const ppWidth = profilePics.children[0].getBoundingClientRect().width;
  const currentPPShift =
    Number.parseFloat(profilePics.style.transform.replace(/[^0-9.]/g, "")) || 0;
  let nextPPShift = currentPPShift - ppWidth;
  if (nextPPShift < 0) {
    nextPPShift = ppWidth * (ppAmount - 1);
  }
  profilePics.style.transform = `translateX(-${nextPPShift}px)`;

  const messages = userWrapper.getElementsByClassName("messages")[0];
  const msgAmount = messages.childElementCount;
  const msgWidth = messages.children[0].getBoundingClientRect().width;
  const currentMsgShift =
    Number.parseFloat(messages.style.transform.replace(/[^0-9.]/g, "")) || 0;
  let nextMsgShift = currentMsgShift - msgWidth;
  if (nextMsgShift < 0) {
    nextMsgShift = msgWidth * (msgAmount - 1);
  }
  messages.style.transform = `translateX(-${nextMsgShift}px)`;
  canShift = false;
  setTimeout(() => {
    if (!canShift) {
      canShift = true;
    }
  }, 500);
};

const nextClient = () => {
  if (!canShift) return;
  nextImage();
  const userWrapper = document
    .getElementById("galeria")
    .getElementsByClassName("user-wrapper")[0];
  const profilePics = userWrapper.getElementsByClassName("pp-photos")[0];
  const ppAmount = profilePics.childElementCount;
  const ppWidth = profilePics.children[0].getBoundingClientRect().width;
  const currentPPShift =
    Number.parseFloat(profilePics.style.transform.replace(/[^0-9.]/g, "")) || 0;
  let nextPPShift = currentPPShift + ppWidth;
  if (nextPPShift > ppWidth * (ppAmount - 1)) {
    nextPPShift = 0;
  }
  profilePics.style.transform = `translateX(-${nextPPShift}px)`;

  const messages = userWrapper.getElementsByClassName("messages")[0];
  const msgAmount = messages.childElementCount;
  const msgWidth = messages.children[0].getBoundingClientRect().width;
  const currentMsgShift =
    Number.parseFloat(messages.style.transform.replace(/[^0-9.]/g, "")) || 0;
  let nextMsgShift = currentMsgShift + msgWidth;
  if (nextMsgShift > msgWidth * (msgAmount - 1)) {
    nextMsgShift = 0;
  }
  messages.style.transform = `translateX(-${nextMsgShift}px)`;
  canShift = false;
  setTimeout(() => {
    if (!canShift) {
      canShift = true;
    }
  }, 500);
};

const startClientInterval = () => {
  return setInterval(() => {
    nextClient();
  }, 5000);
};

window.addEventListener("load", () => {
  if (document.getElementById("nasi-klienti")) {
    photoInterval = startClientInterval();
  } else {
    photoInterval = startInterval();
  }
});
