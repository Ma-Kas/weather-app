import { format } from 'date-fns';
import '../css/style.css';
import weatherDb from '../weather_conditions.json';

const iconDayPath = './day/icon/';
const bgDayPath = './day/bg/';
const iconNightPath = './night/icon/';
const bgNightPath = './night/bg/';

let fullWeatherData = {};

(async function onPageLoad() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search');

  // Populate initial location based on user IP
  fullWeatherData = await fetchWeatherData('auto:ip');
  resetSearchInput(searchInput);
  searchForm.reset();
  updateApp();

  // Hide loading icon, display page
  document.getElementById('loader').style.display = 'none';
  document.getElementById('content').style.visibility = 'visible';

  // Add event listener for search input
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await verifyWeatherData(searchInput);
    resetSearchInput(searchInput);
    searchForm.reset();
    updateApp();
  });
})();

async function fetchWeatherData(lookupLocation) {
  const location = lookupLocation;
  const apiResponse = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=7dfdd5c7ad294aa294643209232707&q=${location}&days=3&aqi=no&alerts=no`,
    { mode: 'cors' },
  );
  if (!apiResponse.ok) {
    return new Error('Bad API Response');
  }
  return apiResponse.json();
}

// Update Sidebar, Main Window, scroll hourly container to current hour
function updateApp() {
  updateSidebar();
  updateMainWindow();
  scrollToCurrentHour();
}

function updateSidebar() {
  const nextDaysContainer = document.getElementById('next-days-container');
  nextDaysContainer.innerHTML = '';
  const currentTemp = document.getElementById('current-temp');
  currentTemp.textContent = `${formatTemperature(
    fullWeatherData.current.temp_c,
  )}C`;

  fullWeatherData.forecast.forecastday.forEach((day) => {
    createDayCards(day);
  });
}

function updateMainWindow() {
  // Update current local date and time
  const todayDate = document.querySelector('.today-date');
  todayDate.textContent = format(
    new Date(fullWeatherData.location.localtime),
    'd MMMM yyyy',
  );
  const todayTime = document.querySelector('.today-time');
  todayTime.textContent = format(
    new Date(fullWeatherData.location.localtime),
    'HH:mm',
  );

  // Update current local weather text and background image
  const todayWeather = document.getElementById('today-weather');
  const content = document.getElementById('content');

  const currentWeatherData = matchWeatherData(
    fullWeatherData.current.condition.code,
  );
  if (fullWeatherData.current.is_day) {
    todayWeather.textContent = currentWeatherData.day;
    content.style.background = `left / cover url('${bgDayPath}${currentWeatherData.icon}.jpg')`;
  } else {
    todayWeather.textContent = currentWeatherData.night;
    content.style.background = `left / cover url('${bgNightPath}${currentWeatherData.icon}.jpg')`;
  }

  createHourlyCards(fullWeatherData.forecast.forecastday[0]);
}

function createDayCards(day) {
  const weatherData = matchWeatherData(day.day.condition.code);
  const nextDaysContainer = document.getElementById('next-days-container');

  const dayForecastContainer = document.createElement('div');
  dayForecastContainer.classList.add('day-forecast-container');

  const weatherIconContainer = document.createElement('div');
  weatherIconContainer.classList.add('weather-icon-container');

  const imgWeatherIcon = document.createElement('img');
  imgWeatherIcon.classList.add('weather-icon');
  imgWeatherIcon.src = `${iconDayPath}${weatherData.icon}.svg`;

  const dayDataCenter = document.createElement('div');
  dayDataCenter.classList.add('day-data-center');

  const dayDate = document.createElement('div');
  dayDate.classList.add('day-date');
  dayDate.textContent = format(new Date(day.date), 'EEEE, MMMM d');

  const dayWeather = document.createElement('div');
  dayWeather.classList.add('day-weather');
  dayWeather.textContent = weatherData.day;

  const lineSeparatorVert = document.createElement('div');
  lineSeparatorVert.classList.add('line-separator-vertical');

  const dayDataRight = document.createElement('div');
  dayDataRight.classList.add('day-data-right');

  const dayMaxTemp = document.createElement('div');
  dayMaxTemp.classList.add('day-max-temp');
  dayMaxTemp.textContent = formatTemperature(day.day.maxtemp_c);

  const dayMinTemp = document.createElement('div');
  dayMinTemp.classList.add('day-min-temp');
  dayMinTemp.textContent = formatTemperature(day.day.mintemp_c);

  nextDaysContainer.appendChild(dayForecastContainer);
  dayForecastContainer.appendChild(weatherIconContainer);
  weatherIconContainer.appendChild(imgWeatherIcon);
  dayForecastContainer.appendChild(dayDataCenter);
  dayDataCenter.appendChild(dayDate);
  dayDataCenter.appendChild(dayWeather);
  dayForecastContainer.appendChild(lineSeparatorVert);
  dayForecastContainer.appendChild(dayDataRight);
  dayDataRight.appendChild(dayMaxTemp);
  dayDataRight.appendChild(dayMinTemp);
}

function createHourlyCards(day) {
  const hourlyCardContainer = document.getElementById('hourly-card-container');
  hourlyCardContainer.innerHTML = '';
  day.hour.forEach((hour) => {
    createHourCard(hour);
  });
}

function createHourCard(hour) {
  const hourlyCardContainer = document.getElementById('hourly-card-container');

  const hourlyCard = document.createElement('div');
  hourlyCard.classList.add('hourly-card');

  // If current card time is current time, add highlight class to card
  if (
    format(new Date(hour.time), 'HH') ===
    format(new Date(fullWeatherData.location.localtime), 'HH')
  ) {
    hourlyCard.classList.add('highlight');
  }

  const cardContent = document.createElement('div');
  cardContent.classList.add('card-content');

  const hourDiv = document.createElement('div');
  hourDiv.classList.add('hour');
  hourDiv.textContent = format(new Date(hour.time), 'HH:mm');

  const lineSeparatorHoriz = document.createElement('div');
  lineSeparatorHoriz.classList.add('line-separator-horizontal');

  const weatherIconContainer = document.createElement('div');
  weatherIconContainer.classList.add('weather-icon-container');

  const imgWeatherIcon = document.createElement('img');
  imgWeatherIcon.classList.add('weather-icon');
  if (hour.is_day) {
    imgWeatherIcon.src = `${iconDayPath}${
      matchWeatherData(hour.condition.code).icon
    }.svg`;
  } else {
    imgWeatherIcon.src = `${iconNightPath}${
      matchWeatherData(hour.condition.code).icon
    }.svg`;
  }

  const hourTemperature = document.createElement('div');
  hourTemperature.classList.add('hour-temperature');
  hourTemperature.textContent = `${formatTemperature(hour.temp_c)}C`;

  hourlyCardContainer.appendChild(hourlyCard);
  hourlyCard.appendChild(cardContent);
  cardContent.appendChild(hourDiv);
  cardContent.appendChild(lineSeparatorHoriz);
  cardContent.appendChild(weatherIconContainer);
  weatherIconContainer.appendChild(imgWeatherIcon);
  cardContent.appendChild(hourTemperature);
}

// Align current hour card on left of container
function scrollToCurrentHour() {
  const hourlyCardContainer = document.getElementById('hourly-card-container');
  const targetIndex =
    Number(format(new Date(fullWeatherData.location.localtime), 'HH')) + 1;
  const hourToScrollTo = hourlyCardContainer.querySelector(
    `.hourly-card:nth-child(${targetIndex})`,
  );
  hourToScrollTo.scrollIntoView({ inline: 'start' });
}

// If search location returns unknown, search for default value (user-ip location)
async function verifyWeatherData(searchInput) {
  fullWeatherData = await fetchWeatherData(searchInput.value);
  if (fullWeatherData instanceof Error) {
    fullWeatherData = await fetchWeatherData('auto:ip');
  }
}

// Set last search term as input placeholder, unfocus input field
function resetSearchInput(searchInput) {
  const searchInputRef = searchInput;
  searchInputRef.placeholder = `${fullWeatherData.location.name}, ${fullWeatherData.location.country}`;
  searchInput.blur();
}

// Return weather names and icons for given weather code
function matchWeatherData(code) {
  for (let i = 0; i < weatherDb.length; i++) {
    if (weatherDb[i].code === code) {
      return weatherDb[i];
    }
  }
  return '';
}

function formatTemperature(inTemp) {
  return `${Math.round(inTemp)}°`;
}
