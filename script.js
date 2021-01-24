$(document).ready(function () {
  $("#citySearch").on("click", function () {
    cityName = $("#searchText").val();
    $("#searchText").val("");
    getWeather(cityName);
    getForecast(cityName);
  });
  populateHistory();
});

//I am aware that API keys should not be uploaded to a repo on github, but no way else to do the homework as needed
const apiKey = "2569a30cd8fc78bd718b309548ae5684";

async function getWeather(cityName) {
  const response1 = await $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`,
    method: "GET",
  });
  //convert temp K to temp F
  const tempF = (response1.main.temp - 273.15) * 1.8 + 32;

  $(".currentConditions").css("display", "block");
  $("#cityName").text(`${response1.name} (${new Date().toLocaleDateString()})`);
  $("#currentConditionsIcon").attr(
    "src",
    `https://openweathermap.org/img/w/${response1.weather[0].icon}.png`
  );
  $("#temperature").text(`Temperature: ${tempF.toFixed(2)}˚F`);
  $("#humidity").text(`Humidity: ${response1.main.humidity}%`);
  $("#wind").text(`Wind Speed: ${response1.wind.speed}MPH`);

  //response1 needed for parameters required in getUVIndex function
  await getUVIndex(response1.coord.lat, response1.coord.lon);

  //pulls proper city name from API instead of using search text to add to the history
  addToHistory(response1.name);
}

async function getForecast(cityName) {
  const response2 = await $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`,
    method: "GET",
  });
  //formats date as MM/DD/YYYY
  let currentDate = new Date().toLocaleDateString();
  let cardCount = 0;
  //clear out any existing cards when searching a new city
  $("#forecastCards").empty();
  //for of loop to cycle through creating cards for forecast
  for (const day of response2.list) {
    const tempF = (day.main.temp - 273.15) * 1.8 + 32;
    const date = new Date(day.dt * 1000).toLocaleDateString();
    if (date !== currentDate) {
      buildCard(date, day.weather[0].icon, tempF.toFixed(2), day.main.humidity);
      currentDate = date;
      cardCount++;
    }
    //cuts off number of days to show forecast at 5
    if (cardCount >= 5) {
      break;
    }
  }
}
//getUVIndex uses coords instead of city name; function called above in getWeather where coords are available in response1
async function getUVIndex(lat, lon) {
  const response3 = await $.ajax({
    url: `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    method: "GET",
  });
  $("#uvIndex").text(`${response3.value}`);
  //remove existing class from previous search
  $("#uvIndex").removeClass();
  //assigns new class based on UV Index integer
  if (response3.value < 3) {
    $("#uvIndex").addClass("btn-success");
  } else if (response3.value < 7) {
    $("#uvIndex").addClass("btn-warning");
  } else {
    $("#uvIndex").addClass("btn-danger");
  }
}

function addToHistory(cityName) {
  const citiesJSON = localStorage.getItem("searchHistory") || "[]";
  const cities = JSON.parse(citiesJSON);
  if (cities.includes(cityName)) {
    return;
  }
  //limits history length to previous 5 cities
  while (cities.length > 5) {
    cities.shift();
  }
  cities.push(cityName);
  localStorage.setItem("searchHistory", JSON.stringify(cities));
  populateHistory();
}

function populateHistory() {
  const citiesJSON = localStorage.getItem("searchHistory") || "[]";
  const cities = JSON.parse(citiesJSON);
  $("#historyList").empty();
  for (const city of cities) {
    $("#historyList").append(
      `<li id='templateHistoryItem' class='list-group-item'>${city}</li>`
    );
  }
  $(".list-group-item").on("click", function () {
    const cityName = this.innerText;
    getWeather(cityName);
    getForecast(cityName);
  });
}

function buildCard(date, icon, temp, humidity) {
  const html = `<div
  class="card"
  style="
    width: 10rem;
    background-color: rgb(0, 102, 255);
    color: white;
  ">
  <div class="card-body">
    <h5 class="card-title">${date}</h5>
    <h6 class="card-subtitle mb-2 text-muted">
      <img src="https://openweathermap.org/img/w/${icon}.png" />
    </h6>
    <p class="card-text">Temp: <span>${temp}</span>˚F</p>
    <p class="card-text">Humidity: <span>${humidity}</span>%</p>
  </div>
</div>`;
  $("#forecastCards").append(html);
}
