// function to get weather based on user input
function getWeather() {
    let city = document.getElementById("cityInput").value;
    if (!city) {
        alert("please enter a city name.");
        return;
    }

    // fetch coordinates for the city
    getCoordinates(city);
}

// function to get weather using current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
        }, error => {
            alert("location access denied. please enter a city manually.");
        });
    } else {
        alert("geolocation is not supported by this browser.");
    }
}

// function to fetch coordinates for a city name
function getCoordinates(city) {
    let geoApiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;

    fetch(geoApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("city not found. try again.");
                return;
            }

            let lat = data[0].lat;
            let lon = data[0].lon;
            fetchWeather(lat, lon);
        })
        .catch(error => {
            console.error("error fetching coordinates:", error);
            alert("failed to fetch city coordinates.");
        });
}

// function to fetch weather from api
function fetchWeather(lat, lon) {
    let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            let weatherCode = data.current.weathercode;
            let weatherIcon = getWeatherIcon(weatherCode);
            
            // update weather info box
            document.getElementById("weatherInfo").innerHTML = `
                <h2>weather now</h2>
                <i class="fas ${weatherIcon}" style="font-size: 50px;"></i>
                <p><strong>temperature:</strong> ${data.current.temperature_2m}°F</p>
                <p><strong>humidity:</strong> ${data.current.relative_humidity_2m}%</p>
                <p><strong>precipitation:</strong> ${data.current.precipitation} in</p>
            `;

            // check if forecast data exists before trying to display
            if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_min && data.daily.weathercode) {
                displayForecast(data.daily);
            } else {
                document.getElementById("forecast").innerHTML = "<p>forecast data not available.</p>";
            }
        })
        .catch(error => {
            console.error("error fetching weather data:", error);
            alert("failed to fetch weather data.");
        });
}

// function to display the 3-day forecast
function displayForecast(daily) {
    let forecastHTML = "";

    // loop through the next 3 days
    for (let i = 0; i < 3; i++) {
        let weatherIcon = getWeatherIcon(daily.weathercode[i]);

        forecastHTML += `
            <div class="forecast-card">
                <i class="fas ${weatherIcon}" style="font-size: 30px;"></i>
                <p>${daily.temperature_2m_max[i]}°F / ${daily.temperature_2m_min[i]}°F</p>
            </div>
        `;
    }

    document.getElementById("forecast").innerHTML = forecastHTML;
}

// function to return weather icons based on api weather codes
function getWeatherIcon(code) {
    let iconMap = {
        0: "fa-sun",
        1: "fa-cloud-sun",
        2: "fa-cloud",
        3: "fa-cloud-showers-heavy",
        4: "fa-snowflake",
        45: "fa-smog",
        48: "fa-smog",
        51: "fa-cloud-rain",
        53: "fa-cloud-rain",
        55: "fa-cloud-rain",
        61: "fa-cloud-showers-heavy",
        63: "fa-cloud-showers-heavy",
        65: "fa-cloud-showers-heavy",
        71: "fa-snowflake",
        73: "fa-snowflake",
        75: "fa-snowflake",
        80: "fa-cloud-showers-heavy",
        81: "fa-cloud-showers-heavy",
        82: "fa-cloud-showers-heavy",
        95: "fa-bolt",
        96: "fa-bolt",
        99: "fa-bolt"
    };
    return iconMap[code] || "fa-question-circle";
}
