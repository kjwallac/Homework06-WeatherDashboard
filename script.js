$(document).ready(function () {
  $("#citySearch").on("click", function () {
    cityName = $("#searchText").val();
    $("#searchText").val("");
    getWeather(cityName);
    getForecast(cityName);
  });
});

const apiKey = "2569a30cd8fc78bd718b309548ae5684";

async function getWeather(cityName) {
  const response1 = await $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`,
    method: "GET",
  });
  const tempF = (response1.main.temp - 273.15) * 1.8 + 32;
  $(".currentConditions").css("display", "block");
  $("#cityName").text(`${response1.name} (${new Date().toLocaleDateString()})`);
  $("#currentConditionsIcon").attr(
    "src",
    `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`
  );
  $("#temperature").text(`Temperature: ${tempF.toFixed(2)}˚F`);
  $("#humidity").text(`Humidity: ${response1.main.humidity}%`);
  $("#wind").text(`Wind Speed: ${response1.wind.speed}MPH`);

  //response1 needed for parameters required in getUVIndex function
  await getUVIndex(response1.coord.lat, response1.coord.lon);
}

async function getForecast(cityName) {
  const response2 = await $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`,
    method: "GET",
  });
  $(".forecastConditions").text(`${response2.list[0].dt_txt}`);
}

async function getUVIndex(lat, lon) {
  const response3 = await $.ajax({
    url: `http://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    method: "GET",
  });
  $("#uvIndex").text(`${response3.value}`);
  $("#uvIndex").removeClass();
  if (response3.value < 3) {
    $("#uvIndex").addClass("btn-success");
  } else if (response3.value < 7) {
    $("#uvIndex").addClass("btn-warning");
  } else {
    $("#uvIndex").addClass("btn-danger");
  }
}
