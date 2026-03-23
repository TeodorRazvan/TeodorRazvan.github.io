const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const message = document.getElementById("message");
const loader = document.getElementById("loader");
const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

const API_KEY = "YOUR_API_KEY_HERE";

async function getWeatherFromUrl(url) {
  try {
    message.textContent = "";
    loader.classList.remove("hidden");
    weatherResult.classList.add("hidden");

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message || "Error fetching weather.");
    }

    displayWeather(data);
    loader.classList.add("hidden");
  } catch (error) {
    message.textContent = error.message;
    loader.classList.add("hidden");
    weatherResult.classList.add("hidden");
  }
}

function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  getWeatherFromUrl(url);
}

function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  getWeatherFromUrl(url);
}

function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${Math.round(data.main.temp)}°`;
  description.textContent = data.weather[0].description;
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} m/s`;

  const iconCode = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;

  setTheme(data.weather[0].main);

  // Re-trigger animation
  weatherResult.classList.add("hidden");
  void weatherResult.offsetWidth;
  weatherResult.classList.remove("hidden");
}

const weatherClasses = ["weather-clear", "weather-clouds", "weather-rain", "weather-snow", "weather-thunder"];

function setTheme(weatherMain) {
  document.body.classList.remove(...weatherClasses);

  const orbColors = {
    clear:       ["rgba(251,191,36,0.18)", "rgba(245,158,11,0.12)"],
    clouds:      ["rgba(100,116,139,0.18)", "rgba(148,163,184,0.12)"],
    rain:        ["rgba(37,99,235,0.18)",  "rgba(96,165,250,0.12)"],
    snow:        ["rgba(186,230,253,0.18)","rgba(224,242,254,0.12)"],
    thunderstorm:["rgba(109,40,217,0.2)",  "rgba(167,139,250,0.12)"],
  };

  const key = weatherMain.toLowerCase();

  switch (key) {
    case "clear":
      document.body.classList.add("weather-clear");
      document.body.style.background = "#0d0b00";
      break;
    case "clouds":
      document.body.classList.add("weather-clouds");
      document.body.style.background = "#0b0d12";
      break;
    case "rain":
      document.body.classList.add("weather-rain");
      document.body.style.background = "#020d1f";
      break;
    case "snow":
      document.body.classList.add("weather-snow");
      document.body.style.background = "#06111a";
      break;
    case "thunderstorm":
      document.body.classList.add("weather-thunder");
      document.body.style.background = "#08001a";
      break;
    default:
      document.body.style.background = "#0b0f1a";
  }

  const colors = orbColors[key] || orbColors.clear;
  document.querySelector(".orb-1").style.background = colors[0];
  document.querySelector(".orb-2").style.background = colors[1];
}

function handleSearch() {
  const city = cityInput.value.trim();
  if (city === "") {
    message.textContent = "Please enter a city name.";
    weatherResult.classList.add("hidden");
    return;
  }
  getWeather(city);
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") handleSearch();
});

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    message.textContent = "Geolocation is not supported.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    function () {
      message.textContent = "Unable to retrieve your location.";
    }
  );
});