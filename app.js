const API_KEY = 'bc2e179af6a07727bb88804acd6f1750';
const BASE_URL_CURRENT = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_FORECAST = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM Element Selectors
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const locationName = document.getElementById('location-name');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');

// --- Utility Function for API Fetching ---
async function fetchWeatherData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }
    return response.json();
}

// --- Main Functions ---

/*
 Fetches and displays weather for a given city name.
 */
async function getCurrentWeather(city) {
    try {
        const currentUrl = `${BASE_URL_CURRENT}?q=${city}&appid=${API_KEY}&units=metric`;
        const currentData = await fetchWeatherData(currentUrl);
        displayCurrentWeather(currentData);
        
        const forecastUrl = `${BASE_URL_FORECAST}?q=${city}&appid=${API_KEY}&units=metric`;
        const forecastData = await fetchWeatherData(forecastUrl);
        displayExtendedForecast(forecastData);

    } catch (error) {
        alert(`Error fetching weather for ${city}: ${error.message}`);
        console.error("Error fetching city weather:", error);
    }
}

/*
 * Fetches and displays weather for given coordinates.
 */
async function getWeatherByCoords(lat, lon) {
    try {
        // Current Weather call using latitude and longitude
        const currentUrl = `${BASE_URL_CURRENT}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const currentData = await fetchWeatherData(currentUrl);
        displayCurrentWeather(currentData);

        // Extended Forecast call using latitude and longitude
        const forecastUrl = `${BASE_URL_FORECAST}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastData = await fetchWeatherData(forecastUrl);
        displayExtendedForecast(forecastData);

    } catch (error) {
        alert("Failed to get weather by current location. Check API key or network connection.");
        console.error("Error fetching weather by coordinates:", error);
    }
}

/*
 * Uses the browser's Geolocation API to get coordinates.
 */
function getCurrentLocation() {
    if (navigator.geolocation) {
        // Disable button during fetching to prevent spamming
        locationBtn.disabled = true; 
        locationBtn.textContent = 'Locating...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success callback
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
                locationBtn.disabled = false;
                locationBtn.textContent = '📍 Get My Location';
            },
            (error) => {
                // Error callback
                locationBtn.disabled = false;
                locationBtn.textContent = '📍 Get My Location';
                let message = "Unable to retrieve your location. ";
                if (error.code === error.PERMISSION_DENIED) {
                    message += "Please allow location access in your browser settings.";
                } else {
                    message += "Geolocation service is unavailable.";
                }
                alert(message);
                console.error("Geolocation error:", error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}


/*
 * Updates the DOM with current weather data.
 */
function displayCurrentWeather(data) {
    if (!data || !data.main || !data.weather) {
        locationName.textContent = "Data Error";
        return;
    }
    
    const tempInC = Math.round(data.main.temp);
    const windKmh = (data.wind?.speed * 3.6).toFixed(1); 

    locationName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${tempInC}°C`;
    description.textContent = data.weather[0].description.toUpperCase();
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${windKmh} km/h`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; // Switched to HTTPS for security
    weatherIcon.alt = data.weather[0].description;
}

/*
 * Updates the DOM with 5-day forecast data.
 */
function displayExtendedForecast(data) {
    forecastContainer.innerHTML = '';

    const dailyData = data.list.filter((reading) => {
        return reading.dt_txt.includes("12:00:00");
    }).slice(0, 5); // Take the next 5 days

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.style.margin= '10px';
        forecastItem.style.display= 'inline-block';
        forecastItem.style.justifyContent= 'center';
        forecastItem.style.flexWrap= 'wrap';
        forecastItem.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon">
            <p>${temp}°C</p>
            <p>${item.weather[0].main}</p> `;
        forecastContainer.appendChild(forecastItem);
    });
}


// --- Initialization ---

function initApp() {
    // 1. Search button listener
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getCurrentWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    // 2. Location button listener
    locationBtn.addEventListener('click', getCurrentLocation);

    // 3. Handle 'Enter' key press
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

    // 4. Load weather on startup (using current location)
    getCurrentLocation(); 
}

// Start the application
initApp();