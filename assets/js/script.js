var inputFieldEl = document.querySelector('#city-input')
var submitBtn = document.querySelector('#submit-btn')
var historyEl = document.querySelector('#past-searches');
var forecastContainerEl = document.querySelector('#forecast')
var currentCityEl = document.querySelector('#current-city');
var pastSearchesEl = localStorage.getItem('history') || '[]';
var pastSearches = JSON.parse(pastSearchesEl);

// Initiates fetch requests and populateData function
function fetchData(cityName) {
    var apiKey = '162c997af48d86f877c2812ef39f3538';
    var requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=metric&appid=' + apiKey;

    // Fetch to grab city coordinates
    fetch(requestUrl)
        .then(response => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(weatherData => {
            var lat = weatherData.coord.lat;
            var lon = weatherData.coord.lon;
            var forecastUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&units=metric&appid=' + apiKey;

            // Fetch to get current and future data
            fetch(forecastUrl)
                .then(resp => {
                    return resp.json();
                })
                .then(forecastData => {
                    // Both data objects are passed into populateData
                    populateData(weatherData, forecastData);

                    saveCity(weatherData.name);
                })

        })
        // Error catching
        .catch((error) => {
            currentCityEl.textContent = error;
            resetPage();
        });

}

function populateData(currentData, forecastData) {

    // Removes previous 5-day forecast, if any
    removeForecastEls();

    // Populates current city info first
    // HTML elements for current city

    var currentTempEl = document.querySelector('#current-temp')
    var currentWindEl = document.querySelector('#current-wind')
    var currentHumidityEl = document.querySelector('#current-humidity')
    var currentUVEl = document.querySelector('#current-uv')

    // Gathering data
    var cityDate = moment().tz(forecastData.timezone).format('L');
    var iconLink = 'http://openweathermap.org/img/wn/' + currentData.weather[0].icon + '.png'
    var currentTemp = currentData.main.temp + '°C';
    var currentWind = convertWind(currentData.wind.deg, currentData.wind.speed);
    var currentHumidity = currentData.main.humidity + '%';
    var currentUV = forecastData.current.uvi;

    // Sets text
    currentCityEl.textContent = currentData.name + ' (' + cityDate + ') '
    currentTempEl.textContent = currentTemp;
    currentWindEl.textContent = currentWind;
    currentHumidityEl.textContent = currentHumidity;
    currentUVEl.textContent = currentUV;

    // Adds weather icon next to current date
    var iconImg = document.createElement('img');
    iconImg.setAttribute('src', iconLink);
    currentCityEl.append(iconImg);

    // Sets background color for UV Index integer
    checkUV(currentUV);

    // Forecast stuff
    for (var i = 1; i <= 5; i++) {
        var cardDivEl = document.createElement('div')
        cardDivEl.setAttribute('class', 'card');
        var dateEl = document.createElement('h2');
        var iconEl = document.createElement('img');
        var tempEl = document.createElement('p');
        var windEl = document.createElement('p');
        var humidityEl = document.createElement('p');

        dateEl.textContent = moment(cityDate).add(i, 'day').format('L');
        var icon = 'http://openweathermap.org/img/wn/' + forecastData.daily[i].weather[0].icon + '.png';
        iconEl.setAttribute('src', icon);
        tempEl.textContent = forecastData.daily[i].temp.day + '°C';
        var windDeg = forecastData.daily[i].wind_deg;
        var windSpd = forecastData.daily[i].wind_speed;
        windEl.textContent = convertWind(windDeg, windSpd);
        humidityEl.textContent = forecastData.daily[i].humidity + '%'

        forecastContainerEl.append(cardDivEl);
        cardDivEl.append(dateEl);
        cardDivEl.append(iconEl);
        cardDivEl.append(tempEl);
        cardDivEl.append(windEl);
        cardDivEl.append(humidityEl);
    }

}

// Removes previous forecast card elements
function removeForecastEls() {
    for (var i = 0; forecastContainerEl.children.length > i; i) {
        forecastContainerEl.removeChild(forecastContainerEl.childNodes[i])
    }
}

// Checks uv index int then adds a corresponding class to uv element
function checkUV(uvi) {
    var quality = ''
    if (uvi < 3) quality = 'good'
    if (uvi > 3 && uvi < 8) quality = 'moderate'
    if (uvi > 8) quality = 'extreme'

    document.querySelector('#current-uv').setAttribute('class', quality + ' uvi');
}

// Returns wind direction and speed using cardinal directions
function convertWind(deg, speed) {

    if (deg >= 349 || deg < 11) deg = "N"
    if (deg >= 11 && deg < 34) deg = "NNE";
    if (deg >= 34 && deg < 56) deg = "NE";
    if (deg >= 56 && deg < 79) deg = "ENE";
    if (deg >= 79 && deg < 101) deg = "E";
    if (deg >= 101 && deg < 124) deg = "ESE";
    if (deg >= 124 && deg < 146) deg = "SE";
    if (deg >= 146 && deg < 169) deg = "SSE";
    if (deg >= 169 && deg < 191) deg = "S";
    if (deg >= 191 && deg < 214) deg = "SSW";
    if (deg >= 214 && deg < 236) deg = "SW";
    if (deg >= 236 && deg < 259) deg = "WSW";
    if (deg >= 259 && deg < 281) deg = "W";
    if (deg >= 281 && deg < 304) deg = "WNW";
    if (deg >= 304 && deg < 326) deg = "NW";
    if (deg >= 326 && deg < 349) deg = "NNW";

    return speed + ' km/h - ' + deg;
}

function resetPage() {
    inputFieldEl.textContent = '';
    removeForecastEls();
}

// Saves city name in history
function saveCity(cityName) {
    if (inputFieldEl.value === '' || pastSearches.includes(cityName)) return;
    makeNewBtn(cityName)
    inputFieldEl.value = '';

    pastSearches.push(cityName);
    localStorage.setItem('history', JSON.stringify(pastSearches));
}

// Makes new buttons
function makeNewBtn(cityName) {
    var newBtn = document.createElement('button')
    newBtn.setAttribute('class', 'history-btn')
    newBtn.textContent = cityName;
    historyEl.append(newBtn);
    newBtn.addEventListener('click', function (event) {
        event.preventDefault;
        fetchData(newBtn.textContent);
    })
}

// Populates history section with city names saved in local storage
function populateHistory() {
    for (var i = 0; i < pastSearches.length; i++) {
        makeNewBtn (pastSearches[i]);
    }
}

submitBtn.addEventListener('click', function (event) {
    event.preventDefault;
    fetchData(inputFieldEl.value);
});

populateHistory();
