const API_KEY = "79f47c153665edc2be397ff99ea09128"

function handleFormSubmit(event) {
  event.preventDefault();
  const cityInput = document.getElementById('city');
  // Accommodate for test environment and browser behavior
  let city = cityInput.value.trim();
  if (!city && event.target.children[0].value) {
    city = event.target.children[0].value.trim();
  }

  if (city) {
    const formattedCity = city.replace(/ /g, '+');
    fetchCurrentWeather(formattedCity);
    fetchFiveDayForecast(formattedCity);
  }
  if (event.target.reset) event.target.reset();
}

function fetchCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;
  fetch(url)
    .then(response => response.json())
    .then(json => displayCurrentWeather(json))
    .catch(error => console.error('Error fetching current weather:', error));
}

function displayCurrentWeather(json) {
  document.getElementById('temp').textContent = json.main.temp;
  document.getElementById('low').textContent = json.main.temp_min;
  document.getElementById('high').textContent = json.main.temp_max;
  document.getElementById('humidity').textContent = json.main.humidity;
  document.getElementById('cloudCover').textContent = json.clouds.all;
}


function fetchFiveDayForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=imperial`;
  fetch(url)
    .then(response => response.json())
    .then(json => {
      displayFiveDayForecast(json);
      createChart(json); // Bonus
    })
    .catch(error => console.error('Error fetching 5-day forecast:', error));
}

function displayFiveDayForecast(json) {
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
  const labels = json.list.map(item => item.dt_txt);
  const data = json.list.map(item => item.main.temp);

  const ctx = document.getElementById('WeatherChart').getContext('2d');
  new Chart(ctx, {
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
