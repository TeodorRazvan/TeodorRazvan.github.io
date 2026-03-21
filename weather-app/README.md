# Weather App

A modern and responsive weather application built with HTML, CSS, and JavaScript.  
It fetches real-time weather data from an external API and displays detailed information about the selected city or the user's current location.

---

## Features

- Search weather by city name
- Get weather using current location (Geolocation API)
- Display temperature, weather condition, humidity, and wind speed
- Dynamic background based on weather conditions
- Loading state with spinner
- Error handling for invalid input or API issues
- Fully responsive design

---

## Technologies Used

- HTML5
- CSS3 (Flexbox, Responsive Design)
- JavaScript (ES6+)
- Fetch API
- OpenWeather API
- Geolocation API

---

## How to Run the Project

1. Clone the repository:

git clone https://github.com/your-username/weather-app.git

2. Navigate to the project folder:
cd weather-app

3. Open index.html in your browser
API Setup

This project uses the OpenWeather API.

Go to: https://openweathermap.org/
Create an account
Generate an API key
Replace this line in script.js:
const API_KEY = "YOUR_API_KEY_HERE";