const prevArrow = document.getElementById("previous");
const nextArrow = document.getElementById("next");
const currentView = document.getElementById("current-day");
let activeNext = false;

let viewType = "day";

const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

let today = new Date();
let date = new Date();
let day = date.getDate();
let month = date.getMonth();
let year = date.getFullYear();

// Datas de fetch
let fetchStartDate, fetchEndDate;

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Texto atual #current-day
function currentText() {
  currentView.textContent = day + " " + months[month] + " " + year;
}
currentText();

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Fetch data
function updateFetchDates() {
  if (viewType === "day") {
    fetchStartDate = new Date(year, month, day).toISOString().split("T")[0];
    fetchEndDate = fetchStartDate;
  } else if (viewType === "week") {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    fetchStartDate = startOfWeek.toISOString().split("T")[0];
    fetchEndDate = endOfWeek.toISOString().split("T")[0];
  } else if (viewType === "month") {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    fetchStartDate = startOfMonth.toISOString().split("T")[0];
    fetchEndDate = endOfMonth.toISOString().split("T")[0];
  }
}
updateFetchDates();

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Previous
prevArrow.addEventListener("click", () => {
  if (viewType === "day") date.setDate(date.getDate() - 1);
  if (viewType === "week") date.setDate(date.getDate() - 7);
  if (viewType === "month") date.setMonth(date.getMonth() - 1);

  day = date.getDate();
  month = date.getMonth();
  year = date.getFullYear();

  currentText();
  updateFetchDates();
  visualization();
  checkNext();
});

// Next
nextArrow.addEventListener("click", () => {
  if (!activeNext) return;

  if (viewType === "day") date.setDate(date.getDate() + 1);
  if (viewType === "week") date.setDate(date.getDate() + 7);
  if (viewType === "month") date.setMonth(date.getMonth() + 1);

  day = date.getDate();
  month = date.getMonth();
  year = date.getFullYear();

  currentText();
  updateFetchDates();
  visualization();
  checkNext();
});

function checkNext() {
  if (date.getTime() < today.getTime()) {
    activeNext = true;
  } else {
    activeNext = false;
  }

  if (activeNext) {
    nextArrow.style.opacity = "1";
  } else {
    nextArrow.style.opacity = "0.7";
  }
}
checkNext();

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Radios do tipo de visualização
const viewRadios = document.querySelectorAll('input[name="view"]');
const viewRadiosLabel = document.querySelectorAll("label");

viewRadios.forEach((radio, index) => {
  radio.addEventListener("change", () => {
    viewRadios.forEach((radio, i) => {
      if (radio.checked) {
        viewType = radio.value;
        viewRadiosLabel[i].style.opacity = "1";
      } else {
        viewRadiosLabel[i].style.opacity = "0.7";
      }
    });

    updateFetchDates();
    visualization();
    checkNext();
  });
});
