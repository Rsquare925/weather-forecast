const weatherIcons = {
	clear: "fas fa-sun",
	clouds: "fas fa-cloud",
	haze: "fas fa-smog",
	mist: "fas fa-cloud-showers-heavy",
	fog: "fas fa-smog",
	smoke: "fas fa-smog",
	dust: "fas fa-wind",
	sand: "fas fa-wind",
	ash: "fas fa-wind",
	drizzle: "fas fa-cloud-rain",
	rain: "fas fa-cloud-showers-heavy",
	thunderstorm: "fas fa-bolt",
	snow: "fas fa-snowflake",
	sleet: "fas fa-cloud-mix",
	"freezing rain": "fas fa-cloud-rain",
	"ice pellets": "fas fa-icicles",
	tornado: "fas fa-wind",
	squall: "fas fa-wind",
	blizzard: "fas fa-snowflake",
	"tropical storm": "fas fa-wind",
	hurricane: "fas fa-wind",
};

const apiKey = "d30d34f0e6e041b43eb613163522e666";
const cityInput = document.getElementById("city-name");
const currentCity = document.getElementById("current-city-name");
const currentCityTemp = document.getElementById("current-city-temp");
const currentCityWind = document.getElementById("current-city-wind");
const currentCityHumid = document.getElementById("current-city-humid");
const currentCityWeatherIcon = document.getElementById(
	"current-city-weather-icon"
);
const forecastCity = document.getElementById("forecast-city");
const inputContainer = document.querySelector(".input-container");
const currentCityWeather = document.getElementById("current-city-weather");
const searchBtn = document.getElementById("search-city");
const useCurrentLocationBtn = document.getElementById("current-location");

// this will give timestamp for next 5 days
function getDates() {
	const dateArr = [];
	let currentDate = new Date();
	for (let i = 1; i < 6; i++) {
		let nextDate = new Date();
		nextDate.setDate(currentDate.getDate() + i);
		dateArr.push(Math.floor(nextDate.getTime() / 1000));
	}

	return dateArr;
}

async function callApi(url) {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching data:", error);
		return error;
	}
}

function setWeatherCondition(condition) {
	currentCityWeather.textContent = condition;
	condition = condition.toLowerCase();
	currentCityWeatherIcon.innerHTML = `<i class="${weatherIcons[condition]} md:text-3xl"></i>`;
}

// this will get current location(lattide and longitude)
async function getLocation(position) {
	// Get latitude and longitude
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;
	const direction = { lat: latitude, lon: longitude };

	await cityData("", direction);
}

// this will handle any error in getting location
function getLocationError(error) {
	const useLocationBtnCotainer = document.getElementById(
		"current-location-btn-container"
	);

	// Handle errors
	if (error.PERMISSION_DENIED) {
		useLocationBtnCotainer.style.setProperty(
			"--error",
			"'User denied the request for Geolocation.'"
		);
	} else if (error.POSITION_UNAVAILABLE) {
		useLocationBtnCotainer.style.setProperty(
			"--error",
			"'Location information is unavailable.'"
		);
	} else if (error.TIMEOUT) {
		useLocationBtnCotainer.style.setProperty(
			"--error",
			"'The request to get user location timed out.'"
		);
	} else {
		useLocationBtnCotainer.style.setProperty(
			"--error",
			"'An unknown error occurred.'"
		);
	}
}
// this will set 5 day forecast
async function setForecast(lat, lon) {
	let currentDate = new Date();
	let month =
		currentDate.getMonth() > 9
			? currentDate.getMonth()
			: "0" + currentDate.getMonth();

	// this will give next five dates
	const dateArr = getDates();
	const cards = document.querySelectorAll(".card-container");

	let i = 0;
	for (let timestamp of dateArr) {
		let apiUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${apiKey}&units=metric`;

		const data = await callApi(apiUrl);

		// this is setting data in DOM for particular date
		cards[i].querySelector(".card-date").textContent = `(${
			currentDate.getDate() + i + 1
		}-${month}-${currentDate.getFullYear()})`;

		cards[i].querySelector(".card-icon").innerHTML = `<i class="${
			weatherIcons[data.data[0].weather[0].main.toLowerCase()]
		}"></i>`;

		cards[i].querySelector(
			".card-temp"
		).innerHTML = `Temp: ${data.data[0].temp}\u00B0C`;
		cards[i].querySelector(
			".card-wind"
		).innerHTML = `Wind: ${data.data[0].wind_speed} M/S`;
		cards[i].querySelector(
			".card-humidity"
		).textContent = `Humidity: ${data.data[0].humidity}%`;

		i += 1;
		// break;
	}
}

// set the city searched to local storage for showing it in input suggestions
function setSuggestion(city) {
	const suggestionListEle = document.getElementById("suggestionsList");
	const cities = localStorage.getItem("cities");

	if (!cities) {
		localStorage.setItem("cities", city);
		suggestionListEle.innerHTML = `<option value="${city}"></option>`;
	} else {
		let cities_list = cities.split(" ");

		if (!cities_list.includes(city)) {
			cities_list.push(city);
			localStorage.setItem("cities", cities_list.join(" "));
		}
		let suggestionsEle = "";
		for (let item of cities_list) {
			suggestionsEle += `<option value="${item}"></option>`;
		}
		suggestionListEle.innerHTML = suggestionsEle;
	}
}

// this function will show weather for particular city or (lat and lon)
async function cityData(city = "", direction = {}) {
	let apiUrl = "";

	if (city) {
		apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
	} else if (Object.keys(direction).length !== 0) {
		apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${direction.lat}&lon=${direction.lon}&appid=${apiKey}&units=metric`;
	} else {
		apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=delhi&appid=${apiKey}&units=metric`;
	}

	let data = await callApi(apiUrl);

	// this is default city if entered city if invalid
	if (data.cod !== 200) {
		inputContainer.style.setProperty("--error", `'${data.message}'`);
		cityInput.classList.add("border-[2px]");

		data = await callApi(
			`https://api.openweathermap.org/data/2.5/weather?q=delhi&appid=${apiKey}&units=metric`
		);
	} else if (data.cod === 200) {
		cityInput.value = "";
	}

	forecastCity.textContent = `5-Day Forecast of ${data.name}`;

	setSuggestion(data.name);

	let currentDate = new Date();
	let month =
		currentDate.getMonth() > 9
			? currentDate.getMonth()
			: "0" + currentDate.getMonth();

	date = `(${currentDate.getDate()}-${month}-${currentDate.getFullYear()})`;

	// setting city data in DOM
	currentCity.textContent = data.name + date;
	currentCityTemp.innerHTML = `<strong>Temperature:</strong> ${data.main.temp}\u00B0C`;
	currentCityWind.innerHTML = `<strong>Wind:</strong> ${data.wind.speed} M/S`;
	currentCityHumid.innerHTML = `<strong>Humidity:</strong> ${data.main.humidity}%`;
	setWeatherCondition(data.weather[0].main);

	const lat = data.coord.lat;
	const lon = data.coord.lon;

	setForecast(lat, lon);
}

cityData();

searchBtn.addEventListener("click", async () => {
	const inputValue = cityInput.value.trim();

	if (inputValue == "" || inputValue.length < 4) {
		cityInput.value = "";
		inputContainer.style.setProperty("--error", "'Input valid city name'");
		cityInput.classList.add("border-[2px]");
	} else {
		inputContainer.style.setProperty("--error", "");
		cityInput.classList.remove("border-[2px]");
		await cityData(inputValue);
	}
});

// this will set weather forecast according to current location
useCurrentLocationBtn.addEventListener("click", async () => {
	const useLocationBtnCotainer = document.getElementById(
		"current-location-btn-container"
	);
	const permissionStatus = await navigator.permissions.query({
		name: "geolocation",
	});

	if (permissionStatus.state !== "denied") {
		navigator.geolocation.getCurrentPosition(getLocation, getLocationError);
	} else if (permissionStatus.state === "denied") {
		useLocationBtnCotainer.style.setProperty(
			"--error",
			"'Geolocation permission was denied. Please enable it in your browser settings.'"
		);
	}
});
