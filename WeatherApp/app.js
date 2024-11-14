const weather = {
    apiKey: "ee6f9f59bffd29f82eae790285cafe01",

    fetchWeather(city) {
        fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
        )
            .then(res => res.json())
            .then(data => this.displayWeather(data))
            .catch(error => console.error("Error fetching weather data:", error));
    },

    fetchSuggestions(query) {
        if (query.length < 3) {
            this.clearSuggestions();
            return;
        }
        fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${this.apiKey}`)
            .then(res => res.json())
            .then(data => this.displayCitySuggestions(data))
            .catch(error => console.error("Error fetching city suggestions:", error));
    },

    displayCitySuggestions(data) {
        const suggestionsDiv = document.getElementById("suggestions");
        suggestionsDiv.innerHTML = "";

        if (!data.list || data.list.length === 0) {
            suggestionsDiv.innerHTML = "<p>No cities found</p>";
            return;
        }

        data.list.forEach(city => {
            const cityDiv = document.createElement("div");
            cityDiv.className = "suggestion-item";
            cityDiv.innerText = city.name;
            cityDiv.addEventListener("click", () => {
                this.fetchWeather(city.name);
                this.fetchForecast(city.name);
                this.clearSuggestions();
            });
            suggestionsDiv.appendChild(cityDiv);
        });
    },

    clearSuggestions() {
        document.getElementById("suggestions").innerHTML = "";
    },

    fetchByLocation(lat, lon) {
        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
        )
            .then(res => res.json())
            .then(data => this.displayWeather(data))
            .catch(error => console.error("Error fetching location weather:", error));
    },

    displayWeather(data) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        document.querySelector(".city").innerText = `Weather in ${name}`;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = Math.round(temp);
        document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
        document.querySelector(".wind").innerText = `Wind speed: ${speed} km/h`;
        document.querySelector(".weather-section").classList.remove("loading");

        this.celsius = temp;
        this.fahrenheit = ((temp * 9 / 5) + 32).toFixed(2);
    },

    search() {
        const city = document.querySelector(".search-bar").value;
        if (city) {
            this.fetchWeather(city);
            this.fetchForecast(city);
            this.clearSuggestions();
        }
    },

    loadWeatherByLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    this.fetchByLocation(latitude, longitude);
                },
                error => console.error("Geolocation error:", error)
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    },

    fetchForecast(city) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`)
            .then(res => res.json())
            .then(data => this.displayForecast(data))
            .catch(error => console.error("Error fetching forecast data:", error));
    },

    displayForecast(data) {
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";

        data.list.slice(0, 5).forEach((forecast, index) => {
            if (index % 8 === 0) {
                const date = new Date(forecast.dt * 1000).toLocaleDateString();
                const { icon } = forecast.weather[0];
                const { temp_max, temp_min } = forecast.main;

                const dayDiv = document.createElement("div");
                dayDiv.className = "forecast-day";
                dayDiv.innerHTML = `
                    <h4>${date}</h4>
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
                    <p>High: ${Math.round(temp_max)}°C</p>
                    <p>Low: ${Math.round(temp_min)}°C</p>
                `;
                forecastDiv.appendChild(dayDiv);
            }
        });
    }
};

// Event listeners
document.querySelector(".search-btn").addEventListener("click", () => weather.search());

document.querySelector(".search-bar").addEventListener("keyup", event => {
    const query = event.target.value;
    weather.fetchSuggestions(query);

    if (event.key === "Enter") {
        weather.search();
    }
});

const temperatureSection = document.querySelector(".temperature");
temperatureSection.addEventListener("click", () => {
    const tempUnit = document.querySelector(".unit");
    const tempDegree = document.querySelector(".temp");

    if (tempUnit.textContent === "°C") {
        tempUnit.textContent = "°F";
        tempDegree.innerText = weather.fahrenheit;
    } else {
        tempUnit.textContent = "°C";
        tempDegree.innerText = Math.round(weather.celsius);
    }
});

// Load weather by location on start
weather.loadWeatherByLocation();