import { format } from "date-fns";
import "../css/style.css";

async function getWeatherData(lookupLocation) {
  const location = lookupLocation;
  // const ipLocation = 'auto:ip';
  const apiResponse = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=7dfdd5c7ad294aa294643209232707&q=${location}&days=3&aqi=no&alerts=no`,
    { mode: "cors" },
  );
  const weatherData = await apiResponse.json();
  console.log(weatherData.forecast.forecastday[0].hour[11]);
}

getWeatherData("osaka");
