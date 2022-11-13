let FOOD_LIST;
let ADDED_INDEXES = [];

const urlify = Urlify.create();

const toggleSearch = () => {
  const searchEl = document.querySelector("section.search");
  if (searchEl.classList.contains("active")) {
    searchEl.classList.remove("active");
    document.body.style.overflow = "scroll";
    searchEl.querySelector("input").value = "";
  } else {
    searchEl.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

const searchTemplate = (i) => {
  return `
  <div class="item" onclick="addItem(${i});">
    <div class="image">
      <img src="${FOOD_LIST[i][1]}" alt="Obrázok ${FOOD_LIST[i][2]}">
    </div>
    <h2 class="title">${FOOD_LIST[i][2]}</h2>
    <p>${FOOD_LIST[i][6]} kcal/100 g</p>
  </div>`;
};

const listTemplate = (itemIndex) => {
  return `
  <div class="item" index="${itemIndex}">
    <span class="material-symbols-outlined delete" onclick="deleteItem(${itemIndex});">delete</span>
    <div class="image">
      <img src="${FOOD_LIST[itemIndex][1]}" alt="Obrázok ${
    FOOD_LIST[itemIndex][2]
  }">
    </div>
    <div class="info">
      <h2 class="title">${FOOD_LIST[itemIndex][2]}</h2>
      <div class="nutrients">
        <div class="nutrient mobile">
          <p class="desc">S/B/T</p>
          <p class="data"><span class="amount">${parseFloat(
            FOOD_LIST[itemIndex][3]
          )}</span>/<span class="amount">${parseFloat(
    FOOD_LIST[itemIndex][4]
  )}</span>/<span class="amount">${parseFloat(
    FOOD_LIST[itemIndex][5]
  )}</span> g</p>
        </div>
        <div class="nutrient">
          <p class="desc">Sacharidy</p>
          <p class="data"><span class="amount">${parseFloat(
            FOOD_LIST[itemIndex][3]
          )}</span> g</p>
        </div>
        <div class="nutrient">
          <p class="desc">Bielkoviny</p>
          <p class="data"><span class="amount">${parseFloat(
            FOOD_LIST[itemIndex][4]
          )}</span> g</p>
        </div>
        <div class="nutrient">
          <p class="desc">Tuky</p>
          <p class="data"><span class="amount">${parseFloat(
            FOOD_LIST[itemIndex][5]
          )}</span> g</p>
        </div>
        <div class="nutrient">
          <p class="desc">Kalórie</p>
          <p class="data"><span class="amount">${parseFloat(
            FOOD_LIST[itemIndex][6]
          )}</span> kcal</p>
        </div>
      </div>
    </div>
    <div class="weight">
      <p class="title">Hmotnosť</p>
      <p class="input">
        <input type="number" name="weight" min="1" value="100" inputmode="numeric" oninput="updateTotal(${itemIndex}, this.value); updateItem(${itemIndex}, this.value, this.parentElement.parentElement.parentElement);">
        g
      </p>
    </div>
  </div>
`;
};

const addItem = (itemIndex) => {
  const searchEl = document.querySelector("section.search");
  searchEl.getElementsByTagName("input")[0].value = null;
  toggleSearch();
  if (ADDED_INDEXES.includes(itemIndex)) return;
  ADDED_INDEXES.push(itemIndex);

  const foodList = document.getElementsByClassName("food-list")[0];
  const item = document.createElement("div");
  foodList.appendChild(item);
  item.outerHTML = listTemplate(itemIndex);

  updateTotal();
};

const updateItem = (itemIndex, weight, parent) => {
  weight = parseInt(weight);
  if (!weight) weight = 0;
  const carbsPerG = parseFloat(FOOD_LIST[itemIndex][3]) / 100;
  const proteinPerG = parseFloat(FOOD_LIST[itemIndex][4]) / 100;
  const fatPerG = parseFloat(FOOD_LIST[itemIndex][5]) / 100;
  const caloriesPerG = parseFloat(FOOD_LIST[itemIndex][6]) / 100;

  // prettier-ignore
  parent.getElementsByClassName("info")[0].innerHTML = `
  <h2 class="title">${FOOD_LIST[itemIndex][2]}</h2>
  <div class="nutrients">
    <div class="nutrient mobile">
      <p class="desc">S/B/T</p>
      <p class="data">
        <span class="amount">${
          Math.round(carbsPerG * weight * 100) / 100
        }</span>/<span class="amount">${
          Math.round(proteinPerG * weight * 100) / 100
        }</span>/<span class="amount">${
          Math.round(fatPerG * weight * 100) / 100
        }</span> g</p>
    </div>
    <div class="nutrient">
      <p class="desc">Sacharidy</p>
      <p class="data"><span class="amount">${
        Math.round(carbsPerG * weight * 100) / 100
      }</span> g</p>
    </div>
    <div class="nutrient">
      <p class="desc">Bielkoviny</p>
      <p class="data"><span class="amount">${
        Math.round(proteinPerG * weight * 100) / 100
      }</span> g</p>
    </div>
    <div class="nutrient">
      <p class="desc">Tuky</p>
      <p class="data"><span class="amount">${
        Math.round(fatPerG * weight * 100) / 100
      }</span> g</p>
    </div>
    <div class="nutrient">
      <p class="desc">Kalórie</p>
      <p class="data"><span class="amount">${
        Math.round(caloriesPerG * weight * 100) / 100
      }</span> kcal</p>
    </div>
  </div>`;
};

const loadFoodFromCsv = () => {
  Papa.parse("/assets/other/Potraviny.csv", {
    download: true,
    complete: (result) => {
      FOOD_LIST = result.data.slice(1, result.data.length - 1);
      loadInitialSearch();
    },
  });
};

const loadInitialSearch = () => {
  const results = document.getElementById("search-results");
  if (!FOOD_LIST || FOOD_LIST.length === 0) {
    results.getElementsByClassName("not-found")[0].classList.remove("hidden");
    return;
  }

  for (let i = 0; i < FOOD_LIST.length; i++) {
    if (i === 10) break;
    const item = document.createElement("div");
    results.appendChild(item);
    item.outerHTML = searchTemplate(i);
  }
};

const updateTotal = () => {
  const allFoods = document.querySelectorAll("section.list .food-list .item");
  const chart = document.querySelector("section.total .chart");
  const calories = document.querySelector("#total-calories .amount");
  const carbsAmount = document.querySelector("#total-carbs .data .amount");
  const proteinAmount = document.querySelector("#total-protein .data .amount");
  const fatAmount = document.querySelector("#total-fat .data .amount");

  // Reset
  calories.innerHTML = 0;
  carbsAmount.innerHTML = 0;
  proteinAmount.innerHTML = 0;
  fatAmount.innerHTML = 0;

  for (const item of allFoods) {
    itemIndex = item.getAttribute("index");
    weight = item.querySelector('input[name="weight"]').value;

    carbsAmount.innerHTML =
      Math.round(
        (parseFloat(carbsAmount.innerHTML) +
          (parseFloat(FOOD_LIST[itemIndex][3]) / 100) * weight) *
          100
      ) / 100;
    proteinAmount.innerHTML =
      Math.round(
        (parseFloat(proteinAmount.innerHTML) +
          (parseFloat(FOOD_LIST[itemIndex][4]) / 100) * weight) *
          100
      ) / 100;
    fatAmount.innerHTML =
      Math.round(
        (parseFloat(fatAmount.innerHTML) +
          (parseFloat(FOOD_LIST[itemIndex][5]) / 100) * weight) *
          100
      ) / 100;

    calories.innerHTML = Math.round(
      parseFloat(calories.innerHTML) +
        (parseFloat(FOOD_LIST[itemIndex][6]) / 100) * weight
    );
  }

  const totalGrams =
    parseFloat(carbsAmount.innerHTML) +
    parseFloat(proteinAmount.innerHTML) +
    parseFloat(fatAmount.innerHTML);

  let carbPercent = parseFloat(carbsAmount.innerHTML) / totalGrams;
  carbPercent = carbPercent || 0;
  let proteinPercent = parseFloat(proteinAmount.innerHTML) / totalGrams;
  proteinPercent = proteinPercent || 0;
  let fatPercent = parseFloat(fatAmount.innerHTML) / totalGrams;
  fatPercent = fatPercent || 0;

  chart.style.setProperty("--data-carbs", (carbPercent * 100).toString() + "%");
  chart.style.setProperty(
    "--data-protein",
    (proteinPercent * 100).toString() + "%"
  );
  chart.style.setProperty("--data-fat", (fatPercent * 100).toString() + "%");

  if (allFoods.length === 0) {
    chart.style.setProperty("--data-carbs", "0%");
    chart.style.setProperty("--data-protein", "0%");
    chart.style.setProperty("--data-fat", "0%");
  }
};

const deleteItem = (itemIndex) => {
  const allFoods = document.querySelectorAll("section.list .food-list .item");

  for (const item of allFoods) {
    if (item.getAttribute("index") === itemIndex.toString()) {
      item.remove();
      ADDED_INDEXES = ADDED_INDEXES.filter(
        (value) => value != item.getAttribute("index")
      );
      break;
    }
  }

  updateTotal();
};

const searchFood = (query) => {
  clearSearch();

  const results = document.getElementById("search-results");
  const notFoundEl = document.querySelector("#search-results .not-found");
  const filteredList = FOOD_LIST.filter((item) => {
    return urlify(item[2].toLowerCase()).includes(urlify(query.toLowerCase()));
  });

  if (query.trim().length === 0) {
    notFoundEl.classList.add("hidden");
    loadInitialSearch();
  } else if (filteredList.length === 0) {
    notFoundEl.classList.remove("hidden");
  } else {
    notFoundEl.classList.add("hidden");
    for (const item of filteredList) {
      const itemEl = document.createElement("div");
      results.appendChild(itemEl);
      itemEl.outerHTML = searchTemplate(item[0]);
    }
  }
};

const clearSearch = () => {
  const items = document.querySelectorAll("#search-results .item");
  for (const item of items) {
    item.remove();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadFoodFromCsv();
});
