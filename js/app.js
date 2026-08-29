const apiKey = "40473051e68ae05adbc89f90b20e0102";
// OpenWeatherMap APIs
const geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q=";
const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";
// HTML elements
const SearchBox = document.querySelector(".search-box input");
const SearchBtn = document.querySelector(".search-btn");
const forecastCards = document.querySelectorAll(".forecast-card");

// ===============================
// GET WEATHER DATA
// ===============================

async function WeatherData(city) {
  try {
    // -------------------------------
    // 1. Find location using Geocoding API
    // -------------------------------

    const geoResponse = await fetch(
      geoUrl + encodeURIComponent(city) + `&limit=5&appid=${apiKey}`,
    );

    if (!geoResponse.ok) {
      throw new Error(`Geocoding response status: ${geoResponse.status}`);
    }

    const locations = await geoResponse.json();

    console.log("Locations found:", locations);

    // No location found
    if (locations.length === 0) {
      throw new Error("Location not found");
    }

    // -------------------------------
    // 2. Prefer Indian location
    // -------------------------------

    const indianLocation = locations.find(
      (location) => location.country === "IN",
    );

    // If Indian location exists, use it.
    // Otherwise use the first result.
    const location = indianLocation || locations[0];

    const latitude = location.lat;
    const longitude = location.lon;

    const forecastResponse = await fetch(
      `${forecastUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`,
    );
    if (!forecastResponse.ok) {
      throw new Error(`Forecast response status: ${forecastResponse.status}`);
    }
    const forecastData = await forecastResponse.json();

    console.log("5 Day Forecast:", forecastData);

    updateForecast(forecastData);
    console.log("Selected location:", location);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    // -------------------------------
    // 3. Get weather using coordinates
    // -------------------------------

    const response = await fetch(
      `${weatherUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`Weather response status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Weather data:", data);

    // ===============================
    // DISPLAY WEATHER DATA
    // ===============================

    // City name
    document.querySelector(".city-name").textContent =
      `${location.name}, ${location.state}`;

    // Temperature
    document.querySelector(".temp").textContent =
      `${Math.round(data.main.temp)}°C`;

    // Feels like
    document.querySelector(".feels-like span").textContent =
      `${Math.round(data.main.feels_like)}°C`;

    // Weather condition
    document.querySelector(".condition").textContent = data.weather[0].main;

    // Humidity
    document.querySelector(".humidity").textContent = data.main.humidity + "%";

    // -------------------------------
    // Wind Speed
    // OpenWeatherMap gives m/s
    // Convert m/s → km/h
    // -------------------------------

    const windSpeed = (data.wind.speed * 3.6).toFixed(1);

    document.querySelector(".wspeed").textContent = windSpeed + " km/h";

    // Visibility
    document.querySelector(".visibility").textContent =
      `${data.visibility / 1000} km`;

    // Pressure
    document.querySelector(".Pressure").textContent =
      data.main.pressure + " mb";

    // ===============================
    // DATE
    // ===============================

    const date = new Date(data.dt * 1000);

    document.querySelector(".current-date").textContent =
      date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // ===============================
    // TIME
    // ===============================

    // City's local time
    const cityTime = new Date(Date.now() + data.timezone * 1000);

    document.querySelector(".time").textContent = cityTime.toLocaleTimeString(
      "en-IN",
      {
        timeZone: "UTC",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    // ===============================
    // WEATHER ICON
    // ===============================

    const condition = data.weather[0].main;
    const icon = data.weather[0].icon;

    const weatherIcon = document.querySelector(".weather-icon");

    // Clear
    if (condition === "Clear") {
      if (icon.endsWith("d")) {
        weatherIcon.src = "assets/icons/clear-day.png";
      } else {
        weatherIcon.src = "assets/icons/clear-night.png";
      }
    }

    // Clouds
    else if (condition === "Clouds") {
      if (icon.endsWith("d")) {
        weatherIcon.src = "assets/icons/partly-cloudy.png";
      } else {
        weatherIcon.src = "assets/icons/partly-cloudy-night.png";
      }
    }

    // Rain
    else if (condition === "Rain") {
      if (icon.endsWith("d")) {
        weatherIcon.src = "assets/icons/rainy-day.png";
      } else {
        weatherIcon.src = "assets/icons/rainy-night.png";
      }
    }

    // Thunderstorm
    else if (condition === "Thunderstorm") {
      weatherIcon.src = "assets/icons/thunderstorm.png";
    }

    // Snow
    else if (condition === "Snow") {
      weatherIcon.src = "assets/icons/snow.png";
    }

    // Fog / Mist / Haze / Smoke etc.
    else {
      weatherIcon.src = "assets/icons/fog.png";
    }

    // ===============================
    // OPTIONAL: DISPLAY LOCATION
    // ===============================

    console.log(
      `Location: ${location.name}, ${location.state || ""}, ${location.country}`,
    );
  } catch (error) {
    console.error("Weather Error:", error.message);
  }
}

// ===============================
// DEFAULT CITY
// ===============================

WeatherData("Pune");

// ===============================
// SEARCH BUTTON
// ===============================

SearchBtn.addEventListener("click", () => {
  console.log("Search button clicked");

  const city = SearchBox.value.trim();

  console.log("City:", city);

  // Empty input
  if (city === "") {
    console.log("Please enter a city name");

    return;
  }

  // Search weather
  WeatherData(city);
});

function updateForecast(forecastData) {
  // Store forecast data according to date
  const dailyForecast = {};

  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);

    const dateKey = date.toLocaleDateString("en-CA");

    if (!dailyForecast[dateKey]) {
      dailyForecast[dateKey] = [];
    }

    dailyForecast[dateKey].push(item);
  });

  console.log("Daily Forecast:", dailyForecast);

  // Get all available dates
  const dates = Object.keys(dailyForecast);

  console.log("Dates:", dates);

  // Take first 5 days
  const fiveDays = dates.slice(1, 6);

  // Update each existing forecast card
  fiveDays.forEach((dateKey, index) => {
    const dailyItems = dailyForecast[dateKey];

    // -----------------------------
    // TEMPERATURES
    // -----------------------------

    const temperatures = dailyItems.map((item) => item.main.temp);

    const minTemp = Math.round(Math.min(...temperatures));

    const maxTemp = Math.round(Math.max(...temperatures));

    // -----------------------------
    // DATE
    // -----------------------------

    const firstItem = dailyItems[0];

    const date = new Date(firstItem.dt * 1000);

    const dayName = date.toLocaleDateString("en-IN", {
      weekday: "short",
    });

    const dateText = date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    // -----------------------------
    // SELECT CARD
    // -----------------------------

    const card = forecastCards[index];

    // -----------------------------
    // UPDATE CARD
    // -----------------------------

    card.querySelector(".day").textContent = dayName;

    card.querySelector(".forecast-date").textContent = dateText;

    card.querySelector(".max-temp").textContent = `${maxTemp}°C`;

    card.querySelector(".min-temp").textContent = `${minTemp}°C`;
  });
}
