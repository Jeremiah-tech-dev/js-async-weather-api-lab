const API_KEY = "79f47c153665edc2be397ff99ea09128"
let weatherChart; // Variable to hold the chart instance

function handleFormSubmit(event) {
  event.preventDefault();
  const cityInput = document.getElementById('city');
  const city = cityInput.value.trim();

  if (city) {
    const formattedCity = city.replace(/ /g, '+');
    fetchCurrentWeather(formattedCity);
    fetchFiveDayForecast(formattedCity);
  }
  event.target.reset();
}

function fetchCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(json => displayCurrentWeather(json))
    .catch(error => console.error('Error fetching current weather:', error));
}

function displayCurrentWeather(json) {
  if (json.cod !== 200) {
    alert(`Error from API: ${json.message}`);
    return;
  }
  document.getElementById('temp').textContent = json.main.temp;
  document.getElementById('low').textContent = json.main.temp_min;
  document.getElementById('high').textContent = json.main.temp_max;
  document.getElementById('humidity').textContent = json.main.humidity;
  document.getElementById('cloudCover').textContent = json.clouds.all;
}


function fetchFiveDayForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(json => {
      displayFiveDayForecast(json);
      createChart(json); // Bonus
    })
    .catch(error => console.error('Error fetching 5-day forecast:', error));
}

function displayFiveDayForecast(json) {
  if (json.cod !== "200") {
    // The forecast API returns the code as a string "200"
    // No need to alert here, the current weather display already did.
    return;
  }
  const aside = document.querySelector('aside');
  aside.innerHTML = ''; // Clear previous forecast

  json.list.forEach(forecast => {
    const forecastDiv = document.createElement('div');
    forecastDiv.innerHTML = `
      <p><strong>${forecast.dt_txt}</strong></p>
      <p>Temp: ${forecast.main.temp}°F</p>
      <p>Humidity: ${forecast.main.humidity}%</p>
    `;
    aside.appendChild(forecastDiv);
  });
}

function createChart(json) {
  if (json.cod !== "200") {
    return; // Don't try to create a chart if there's no data
  }

  // If a chart instance exists, destroy it before creating a new one
  if (weatherChart) {
    weatherChart.destroy();
  }

  const labels = json.list.map(item => item.dt_txt);
  const data = json.list.map(item => item.main.temp);

  const ctx = document.getElementById('WeatherChart').getContext('2d');
  // Store the new chart instance in our variable
  weatherChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°F) for the next 5 days',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        data: data,
        fill: false,
      }]
    },
    options: {}
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const cityForm = document.getElementById('cityForm');
  cityForm.addEventListener('submit', handleFormSubmit);
});
