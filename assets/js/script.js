var inputFieldEl = document.querySelector('#city-input')
var submitBtn = document.querySelector('#submit-btn')


// Initiates fetch requests and populateData function
function fetchData(event) {
    event.preventDefault();
    var cityName = inputFieldEl.value;
    var apiKey = '162c997af48d86f877c2812ef39f3538';
    var requestUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey;

    // Fetch to grab city coordinates
    fetch(requestUrl)
        .then(response => {
            return response.json();
        })
        .then(weatherData => {

            var lat = weatherData.coord.lat;
            var lon = weatherData.coord.lon;
            var forecastUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&appid=' + apiKey;

            // Fetch to get current and future data
            fetch(forecastUrl)
                .then(resp => {
                    console.log(resp);
                    return resp.json();
                })
                .then(forecastData => {
                    // Both data objects are passed into populateData
                    populateData(weatherData, forecastData);
                })
            // .catch(err => {
            //     errorCatch(err);
            // })

        });
}

function populateData(currentData, forecastData) {
    console.log(forecastData.timezone)

    // Populates current city info first
    var currentContainerEl = document.querySelector('#current-weather');
    var currentCityEl = document.querySelector('#current-city');

    currentCityEl.textContent = currentData.name + ' (' + cityDate + ') '




    var cityDate = moment().tz(forecastData.timezone).format('L');

    var iconLink = 'http://openweathermap.org/img/wn/' + currentData.weather[0].icon + '.png'

    console.log(moment().tz(forecastData.timezone).format('L'))


    var iconImg = document.createElement('img');
    iconImg.setAttribute('src', iconLink);
    currentCityEl.append(iconImg);

}

function populateCurrent(currentData) {
    console.log(currentData.name);

    console.log(currentData.timezone);

    var currentContainerEl = document.querySelector('#current-weather');
    currentContainerEl.children[0].textContent = currentData.name;

}

function resetPage() {
    inputFieldEl.value = '';
}

// To be written later
// function errorCatch(error){

// }

submitBtn.addEventListener('click', fetchData);
