// from datetime import datetime

const apiKey = "d30d34f0e6e041b43eb613163522e666";
const currentCity = document.getElementById("current-city-name");
const currentCityTemp = document.getElementById("current-city-temp");
const currentCityWind = document.getElementById("current-city-wind");
const currentCityHumid = document.getElementById("current-city-humid");

function getDates() {
	const dateArr = [];
	let currentDate = new Date();
	for (let i = 1; i < 6; i++) {
		let date = currentDate.getDate() + i;
		let month =
			currentDate.getMonth() > 9
				? currentDate.getMonth()
				: "0" + currentDate.getMonth();
		let year = currentDate.getFullYear();
		dateArr.push(`${year}-${month}-${date}`);
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

// this will get current location(lattide and longitude)
function getLocation(position) {
	// Get latitude and longitude
	const latitude = position.coords.latitude;
	const longitude = position.coords.longitude;

	// Print or use the latitude and longitude as needed
	console.log("Latitude:", latitude);
	console.log("Longitude:", longitude);
}

// this will handle any error in getting location
function getLocationError(error) {
	// Handle errors
	if (error.PERMISSION_DENIED) {
		console.log("User denied the request for Geolocation.");
	} else if (error.POSITION_UNAVAILABLE) {
		console.log("Location information is unavailable.");
	} else if (error.TIMEOUT) {
		console.log("The request to get user location timed out.");
	} else {
		console.log("An unknown error occurred.");
	}
}

async function delhiData(city) {
	let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=delhi&appid=${apiKey}&units=metric&cnt=40`;

	// apiUrl = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=28.6667&lon=77.2167&date=2024-04-13&appid=${apiKey}&units=metric`

	const data = await callApi(apiUrl);

	currentCity.textContent = data.name;
	currentCityTemp.textContent = data.main.temp;
	currentCityWind.textContent = data.wind.speed;
	currentCityHumid.textContent = data.main.humidity;

	const lat = data.coord.lat;
	const lon = data.coord.lon;
	// this will give next five dates
	const dateArr = getDates();
	for (let date of dateArr) {
		let apiUrl = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${date}&appid=${apiKey}&units=metric`;
		console.log(apiUrl);
	}
	// console.log(lat, lon);
}

delhiData();

navigator.geolocation.getCurrentPosition(getLocation, getLocationError);

// getDates()
