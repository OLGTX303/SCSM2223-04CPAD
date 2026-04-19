(function () {
  "use strict";

  const WEATHER_CODES = {
    0: { label: "Clear sky", icon: "☀️" },
    1: { label: "Mainly clear", icon: "🌤️" },
    2: { label: "Partly cloudy", icon: "⛅" },
    3: { label: "Overcast", icon: "☁️" },
    45: { label: "Fog", icon: "🌫️" },
    48: { label: "Depositing rime fog", icon: "🌫️" },
    51: { label: "Light drizzle", icon: "🌦️" },
    53: { label: "Moderate drizzle", icon: "🌦️" },
    55: { label: "Dense drizzle", icon: "🌧️" },
    56: { label: "Light freezing drizzle", icon: "🌧️" },
    57: { label: "Dense freezing drizzle", icon: "🌧️" },
    61: { label: "Slight rain", icon: "🌦️" },
    63: { label: "Moderate rain", icon: "🌧️" },
    65: { label: "Heavy rain", icon: "🌧️" },
    66: { label: "Light freezing rain", icon: "🌧️" },
    67: { label: "Heavy freezing rain", icon: "🌧️" },
    71: { label: "Slight snow fall", icon: "🌨️" },
    73: { label: "Moderate snow fall", icon: "❄️" },
    75: { label: "Heavy snow fall", icon: "❄️" },
    77: { label: "Snow grains", icon: "🌨️" },
    80: { label: "Slight rain showers", icon: "🌦️" },
    81: { label: "Moderate rain showers", icon: "🌧️" },
    82: { label: "Violent rain showers", icon: "⛈️" },
    85: { label: "Slight snow showers", icon: "🌨️" },
    86: { label: "Heavy snow showers", icon: "❄️" },
    95: { label: "Thunderstorm", icon: "⛈️" },
    96: { label: "Thunderstorm with hail", icon: "⛈️" },
    99: { label: "Severe thunderstorm with hail", icon: "⛈️" }
  };

  const state = {
    activeUnit: "c",
    lastSearch: "Johor Bahru",
    lastResolvedTimezone: "",
    pendingDebounceId: null,
    activeController: null,
    recentSearches: readRecentSearches(),
    currentPayload: null
  };

  const dom = {
    cityInput: document.getElementById("cityInput"),
    searchBtn: document.getElementById("searchBtn"),
    retryBtn: document.getElementById("retryBtn"),
    validationMessage: document.getElementById("validationMessage"),
    errorBanner: document.getElementById("errorBanner"),
    errorMessage: document.getElementById("errorMessage"),
    recentSearches: document.getElementById("recentSearches"),
    cityName: document.getElementById("cityName"),
    weatherIcon: document.getElementById("weatherIcon"),
    temperatureValue: document.getElementById("temperatureValue"),
    weatherDescription: document.getElementById("weatherDescription"),
    humidityValue: document.getElementById("humidityValue"),
    windValue: document.getElementById("windValue"),
    timeValue: document.getElementById("timeValue"),
    coordinateValue: document.getElementById("coordinateValue"),
    forecastRow: document.getElementById("forecastRow"),
    celsiusBtn: document.getElementById("celsiusBtn"),
    fahrenheitBtn: document.getElementById("fahrenheitBtn")
  };

  function init() {
    renderForecastSkeleton();
    renderRecentSearches();
    attachEventListeners();
    dom.cityInput.value = state.lastSearch;
    runSearch(state.lastSearch);
  }

  function attachEventListeners() {
    dom.searchBtn.addEventListener("click", function () {
      triggerImmediateSearch(dom.cityInput.value);
    });

    dom.retryBtn.addEventListener("click", function () {
      runSearch(state.lastSearch);
    });

    dom.cityInput.addEventListener("input", function () {
      const rawValue = dom.cityInput.value.trim();
      clearTimeout(state.pendingDebounceId);

      if (rawValue.length === 0) {
        setValidationMessage("");
        return;
      }

      state.pendingDebounceId = window.setTimeout(function () {
        runSearch(rawValue);
      }, 500);
    });

    dom.cityInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        triggerImmediateSearch(dom.cityInput.value);
      }
    });

    dom.celsiusBtn.addEventListener("click", function () {
      setUnit("c");
    });

    dom.fahrenheitBtn.addEventListener("click", function () {
      setUnit("f");
    });

    dom.recentSearches.addEventListener("click", function (event) {
      const chip = event.target.closest("[data-city]");
      if (!chip) {
        return;
      }

      const city = chip.getAttribute("data-city");
      dom.cityInput.value = city;
      triggerImmediateSearch(city);
    });
  }

  function triggerImmediateSearch(query) {
    clearTimeout(state.pendingDebounceId);
    runSearch(query);
  }

  async function runSearch(rawQuery) {
    const city = rawQuery.trim();

    if (city.length === 0) {
      setValidationMessage("Please enter a city name.");
      return;
    }

    if (city.length < 2) {
      setValidationMessage("Enter at least 2 characters before searching.");
      return;
    }

    setValidationMessage("");
    hideErrorBanner();
    showLoadingState();

    if (state.activeController) {
      state.activeController.abort();
      state.activeController = null;
    }

    try {
      const location = await fetchCoordinates(city);
      if (!location) {
        showEmptyResult(city);
        return;
      }

      state.lastSearch = location.name;
      state.lastResolvedTimezone = location.timezone || "";
      saveRecentSearch(location.name);

      const weatherPayload = await fetchWeather(location.latitude, location.longitude);
      state.currentPayload = transformWeatherData(location, weatherPayload);
      renderWeather(state.currentPayload);
      fetchLocalTime(state.lastResolvedTimezone);
    } catch (error) {
      if (error.name === "AbortError") {
        showError("The request timed out after 10 seconds. Please retry.");
        return;
      }

      showError(error.message || "Unable to load weather data right now.");
    }
  }

  async function fetchCoordinates(city) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", city);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const geocodeResponse = await fetchWithTimeout(url.toString());
    const geocodeData = await geocodeResponse.json();
    const results = Array.isArray(geocodeData.results) ? geocodeData.results : [];

    if (results.length === 0) {
      return null;
    }

    return results[0];
  }

  async function fetchWeather(latitude, longitude) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code");
    url.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "auto");

    const weatherResponse = await fetchWithTimeout(url.toString());
    return weatherResponse.json();
  }

  async function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(function () {
      controller.abort();
    }, 10000);

    state.activeController = controller;

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response;
    } finally {
      clearTimeout(timeoutId);
      if (state.activeController === controller) {
        state.activeController = null;
      }
    }
  }

  function transformWeatherData(location, weatherPayload) {
    const current = weatherPayload.current || {};
    const hourly = weatherPayload.hourly || {};
    const daily = weatherPayload.daily || {};
    const timezone = location.timezone || weatherPayload.timezone || "";
    const weatherMeta = lookupWeather(current.weather_code);
    const currentHourIndex = Array.isArray(hourly.time) ? hourly.time.indexOf(current.time) : -1;

    const humidity = current.relative_humidity_2m !== undefined
      ? current.relative_humidity_2m
      : readHourlyValue(hourly.relative_humidity_2m, currentHourIndex);

    const windSpeed = current.wind_speed_10m !== undefined
      ? current.wind_speed_10m
      : readHourlyValue(hourly.wind_speed_10m, currentHourIndex);

    return {
      cityName: buildCityLabel(location),
      coordinateLabel: formatCoordinates(location.latitude, location.longitude),
      timezone: timezone,
      current: {
        temperatureC: current.temperature_2m,
        humidity: humidity,
        windKmh: windSpeed,
        icon: weatherMeta.icon,
        description: weatherMeta.label
      },
      forecast: buildForecastItems(daily)
    };
  }

  function buildForecastItems(daily) {
    const days = Array.isArray(daily.time) ? daily.time : [];
    const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
    const lows = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
    const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];

    return days.slice(0, 7).map(function (day, index) {
      const meta = lookupWeather(codes[index]);
      return {
        dayLabel: formatDayName(day),
        description: meta.label,
        icon: meta.icon,
        highC: highs[index],
        lowC: lows[index]
      };
    });
  }

  function renderWeather(payload) {
    clearCurrentSkeleton();
    hideErrorBanner();

    dom.cityName.textContent = payload.cityName;
    dom.weatherIcon.textContent = payload.current.icon;
    dom.temperatureValue.textContent = formatTemperature(payload.current.temperatureC, state.activeUnit);
    dom.weatherDescription.textContent = payload.current.description;
    dom.humidityValue.textContent = payload.current.humidity + "%";
    dom.windValue.textContent = formatWind(payload.current.windKmh, state.activeUnit);
    dom.coordinateValue.textContent = payload.coordinateLabel;
    dom.timeValue.textContent = "Loading local time...";

    renderForecastCards(payload.forecast);
  }

  function renderForecastCards(forecastItems) {
    removeChildren(dom.forecastRow);

    forecastItems.forEach(function (item) {
      const card = document.createElement("article");
      card.classList.add("forecast-card");

      const day = document.createElement("p");
      day.classList.add("forecast-day");
      day.textContent = item.dayLabel;

      const icon = document.createElement("span");
      icon.classList.add("forecast-icon");
      icon.textContent = item.icon;

      const description = document.createElement("p");
      description.classList.add("forecast-desc");
      description.textContent = item.description;

      const temps = document.createElement("div");
      temps.classList.add("forecast-temps");

      const high = document.createElement("span");
      high.classList.add("forecast-high");
      high.textContent = formatTemperature(item.highC, state.activeUnit);

      const low = document.createElement("span");
      low.classList.add("forecast-low");
      low.textContent = formatTemperature(item.lowC, state.activeUnit);

      temps.appendChild(high);
      temps.appendChild(low);
      card.appendChild(day);
      card.appendChild(icon);
      card.appendChild(description);
      card.appendChild(temps);
      dom.forecastRow.appendChild(card);
    });
  }

  function renderForecastSkeleton() {
    removeChildren(dom.forecastRow);

    for (let index = 0; index < 7; index += 1) {
      const card = document.createElement("article");
      card.classList.add("forecast-card");

      const day = document.createElement("div");
      day.classList.add("skeleton", "skeleton-text");
      day.style.height = "16px";
      day.style.marginBottom = "22px";

      const icon = document.createElement("div");
      icon.classList.add("skeleton", "skeleton-circle");
      icon.style.margin = "0 auto 18px";

      const desc = document.createElement("div");
      desc.classList.add("skeleton", "skeleton-text");
      desc.style.height = "34px";
      desc.style.marginBottom = "18px";

      const temps = document.createElement("div");
      temps.classList.add("skeleton", "skeleton-text");
      temps.style.height = "18px";

      card.appendChild(day);
      card.appendChild(icon);
      card.appendChild(desc);
      card.appendChild(temps);
      dom.forecastRow.appendChild(card);
    }
  }

  function fetchLocalTime(timezone) {
    if (!timezone) {
      dom.timeValue.textContent = formatBrowserTime();
      return;
    }

    const requestUrl = "https://worldtimeapi.org/api/timezone/" + timezone;

    $.getJSON(requestUrl)
      .done(function (response) {
        if (response && response.datetime) {
          dom.timeValue.textContent = formatRemoteTime(response.datetime, timezone);
          return;
        }

        dom.timeValue.textContent = formatBrowserTime();
      })
      .fail(function () {
        dom.timeValue.textContent = formatBrowserTime();
      })
      .always(function () {
        console.log("WorldTimeAPI request finished at", new Date().toISOString());
      });
  }

  function showLoadingState() {
    addCurrentSkeleton();
    renderForecastSkeleton();
    dom.timeValue.textContent = "--";
  }

  function addCurrentSkeleton() {
    dom.cityName.classList.add("skeleton", "skeleton-text", "skeleton-title");
    dom.weatherIcon.classList.add("skeleton", "skeleton-circle");
    dom.temperatureValue.classList.add("skeleton", "skeleton-number");
    dom.weatherDescription.classList.add("skeleton", "skeleton-text");
    dom.humidityValue.classList.add("skeleton", "skeleton-text");
    dom.windValue.classList.add("skeleton", "skeleton-text");
    dom.timeValue.classList.add("skeleton", "skeleton-text");
    dom.coordinateValue.classList.add("skeleton", "skeleton-text");

    dom.cityName.textContent = "Loading city";
    dom.weatherIcon.textContent = "";
    dom.temperatureValue.textContent = "--";
    dom.weatherDescription.textContent = "Loading description";
    dom.humidityValue.textContent = "--";
    dom.windValue.textContent = "--";
    dom.timeValue.textContent = "--";
    dom.coordinateValue.textContent = "--";
  }

  function clearCurrentSkeleton() {
    [
      dom.cityName,
      dom.weatherIcon,
      dom.temperatureValue,
      dom.weatherDescription,
      dom.humidityValue,
      dom.windValue,
      dom.timeValue,
      dom.coordinateValue
    ].forEach(function (element) {
      element.classList.remove("skeleton", "skeleton-text", "skeleton-title", "skeleton-number", "skeleton-circle");
    });
  }

  function showError(message) {
    dom.errorMessage.textContent = message;
    dom.errorBanner.classList.remove("is-hidden");
  }

  function hideErrorBanner() {
    dom.errorBanner.classList.add("is-hidden");
  }

  function showEmptyResult(city) {
    clearCurrentSkeleton();
    dom.cityName.textContent = "No city found";
    dom.weatherIcon.textContent = "🔎";
    dom.temperatureValue.textContent = "--";
    dom.weatherDescription.textContent = "No matching city was returned for " + city + ".";
    dom.humidityValue.textContent = "--";
    dom.windValue.textContent = "--";
    dom.timeValue.textContent = formatBrowserTime();
    dom.coordinateValue.textContent = "--";
    renderForecastCards([]);
    showError("No city matched your search. Try a more specific place name.");
  }

  function setValidationMessage(message) {
    dom.validationMessage.textContent = message;
  }

  function setUnit(unit) {
    if (state.activeUnit === unit) {
      return;
    }

    state.activeUnit = unit;
    dom.celsiusBtn.classList.toggle("is-active", unit === "c");
    dom.fahrenheitBtn.classList.toggle("is-active", unit === "f");

    if (state.currentPayload) {
      renderWeather(state.currentPayload);
      fetchLocalTime(state.lastResolvedTimezone);
    }
  }

  function renderRecentSearches() {
    removeChildren(dom.recentSearches);

    state.recentSearches.forEach(function (city) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.classList.add("recent-chip");
      chip.setAttribute("data-city", city);
      chip.textContent = city;
      dom.recentSearches.appendChild(chip);
    });
  }

  function saveRecentSearch(city) {
    state.recentSearches = [city].concat(
      state.recentSearches.filter(function (entry) {
        return entry.toLowerCase() !== city.toLowerCase();
      })
    ).slice(0, 5);

    localStorage.setItem("weathernow-recent-searches", JSON.stringify(state.recentSearches));
    renderRecentSearches();
  }

  function readRecentSearches() {
    try {
      const raw = localStorage.getItem("weathernow-recent-searches");
      const parsed = JSON.parse(raw || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function lookupWeather(code) {
    return WEATHER_CODES[code] || { label: "Weather data unavailable", icon: "❔" };
  }

  function buildCityLabel(location) {
    const parts = [location.name, location.admin1, location.country].filter(Boolean);
    return parts.join(", ");
  }

  function formatCoordinates(latitude, longitude) {
    if (latitude === undefined || longitude === undefined) {
      return "--";
    }

    return latitude.toFixed(2) + ", " + longitude.toFixed(2);
  }

  function readHourlyValue(series, index) {
    if (!Array.isArray(series) || index < 0) {
      return "--";
    }

    return series[index];
  }

  function formatDayName(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  function formatTemperature(valueCelsius, unit) {
    if (valueCelsius === undefined || valueCelsius === null || valueCelsius === "--") {
      return "--";
    }

    if (unit === "f") {
      return Math.round((valueCelsius * 9) / 5 + 32) + "°F";
    }

    return Math.round(valueCelsius) + "°C";
  }

  function formatWind(valueKmh, unit) {
    if (valueKmh === undefined || valueKmh === null || valueKmh === "--") {
      return "--";
    }

    if (unit === "f") {
      return Math.round(valueKmh / 1.609) + " mph";
    }

    return Math.round(valueKmh) + " km/h";
  }

  function formatBrowserTime() {
    return new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function formatRemoteTime(datetime, timezone) {
    const date = new Date(datetime);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: timezone
    });
  }

  function removeChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  init();
}());
