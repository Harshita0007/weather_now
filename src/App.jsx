
import React, { useState } from 'react';
import {
  Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge,
  Search, MapPin, Loader2, CloudSnow, CloudDrizzle, CloudFog
} from 'lucide-react';

const WeatherApp = () => {
  // State management using React hooks
  const [city, setCity] = useState(''); // User's search input
  const [weather, setWeather] = useState(null); // Weather data from API
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error messages for user feedback

  /**
   * Maps WMO weather codes to human-readable descriptions
   * @param {number} code - WMO weather interpretation code
   * @returns {string} Weather description
   */
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
  };

  /**
   * Returns appropriate weather icon based on weather code
   * @param {number} code - WMO weather interpretation code
   * @returns {JSX.Element} Lucide React icon component
   */
  const getWeatherIcon = (code) => {
    // Clear and mainly clear
    if (code === 0 || code === 1) return <Sun className="w-16 h-16 text-yellow-400" />;

    // Cloudy conditions
    if (code === 2 || code === 3) return <Cloud className="w-16 h-16 text-gray-400" />;

    // Fog
    if (code === 45 || code === 48) return <CloudFog className="w-16 h-16 text-gray-500" />;

    // Drizzle
    if (code >= 51 && code <= 55) return <CloudDrizzle className="w-16 h-16 text-blue-400" />;

    // Rain
    if (code >= 61 && code <= 67) return <CloudRain className="w-16 h-16 text-blue-500" />;

    // Snow
    if (code >= 71 && code <= 77) return <CloudSnow className="w-16 h-16 text-blue-300" />;

    // Rain showers
    if (code >= 80 && code <= 82) return <CloudRain className="w-16 h-16 text-blue-600" />;

    // Snow showers
    if (code >= 85 && code <= 86) return <CloudSnow className="w-16 h-16 text-blue-400" />;

    // Default fallback
    return <Cloud className="w-16 h-16 text-gray-400" />;
  };

  /**
   * Fetches geographic coordinates for a given city name
   * Uses Open-Meteo Geocoding API
   * @param {string} cityName - Name of the city to search
   * @returns {Promise<Object>} Object containing lat, lon, name, and country
   * @throws {Error} If city is not found
   */
  const getCityCoordinates = async (cityName) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    const data = await response.json();

    // Error handling: City not found
    if (!data.results || data.results.length === 0) {
      throw new Error('City not found. Please try another city name.');
    }

    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country
    };
  };

  /**
   * Fetches current weather data for given coordinates
   * Uses Open-Meteo Weather API
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data object
   */
  const fetchWeather = async (lat, lon) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`
    );
    const data = await response.json();
    return data;
  };

  /**
   * Handles the weather search process
   * Orchestrates geocoding and weather data fetching
   * Updates UI states accordingly
   */
  const handleSearch = async () => {
    // Validation: Check if city input is empty
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    // Set loading state and clear previous data
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      // Step 1: Get coordinates for the city
      const coords = await getCityCoordinates(city);

      // Step 2: Fetch weather data using coordinates
      const weatherData = await fetchWeather(coords.lat, coords.lon);

      // Step 3: Update state with combined data
      setWeather({
        ...weatherData.current,
        cityName: coords.name,
        country: coords.country
      });
    } catch (err) {
      // Error handling: Display user-friendly error message
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      // Always stop loading, whether successful or not
      setLoading(false);
    }
  };

  /**
   * Handles Enter key press in search input
   * @param {Event} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4">
            Weather Now
          </h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg">
            Check current weather conditions for any city
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name (e.g., London, Tokyo, New York)"
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg bg-white/90 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                aria-label="City search input"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
              aria-label="Search weather"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl mb-8 text-center" role="alert">
            {error}
          </div>
        )}

        {/* Weather Data Display */}
        {weather && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">

            {/* Location Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                {weather.cityName}
              </h2>
              <p className="text-blue-100 text-lg sm:text-xl">{weather.country}</p>
            </div>

            {/* Main Weather Information */}
            <div className="flex flex-col items-center mb-8 sm:mb-12">
              {/* Weather Icon */}
              <div className="mb-4 sm:mb-6">
                {getWeatherIcon(weather.weather_code)}
              </div>

              {/* Temperature */}
              <div className="text-6xl sm:text-7xl md:text-8xl font-bold mb-2 sm:mb-4">
                {Math.round(weather.temperature_2m)}°C
              </div>

              {/* Weather Description */}
              <div className="text-xl sm:text-2xl md:text-3xl text-blue-100 mb-2">
                {getWeatherDescription(weather.weather_code)}
              </div>

              {/* Feels Like Temperature */}
              <div className="text-base sm:text-lg text-blue-200">
                Feels like {Math.round(weather.apparent_temperature)}°C
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

              {/* Humidity Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                <Droplets className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {weather.relative_humidity_2m}%
                </div>
                <div className="text-xs sm:text-sm text-blue-200">Humidity</div>
              </div>

              {/* Wind Speed Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                <Wind className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {Math.round(weather.wind_speed_10m)}
                </div>
                <div className="text-xs sm:text-sm text-blue-200">km/h</div>
              </div>

              {/* Wind Direction Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                <Gauge className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {weather.wind_direction_10m}°
                </div>
                <div className="text-xs sm:text-sm text-blue-200">Direction</div>
              </div>

              {/* Weather Condition Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                <div className="text-lg sm:text-xl font-bold mb-1">
                  {getWeatherDescription(weather.weather_code)}
                </div>
                <div className="text-xs sm:text-sm text-blue-200">Condition</div>
              </div>
            </div>

            {/* Last Updated Timestamp */}
            <div className="text-center mt-6 sm:mt-8 text-blue-200 text-xs sm:text-sm">
              Last updated: {new Date(weather.time).toLocaleString()}
            </div>
          </div>
        )}

        {/* Initial Empty State */}
        {!weather && !loading && !error && (
          <div className="text-center text-white/80 mt-12 sm:mt-16">
            <Cloud className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 opacity-50" />
            <p className="text-lg sm:text-xl md:text-2xl">
              Enter a city name to check the weather
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 text-white/60 text-xs sm:text-sm">
          <p>Powered by Open-Meteo API</p>
          <p className="mt-2">Built for Jamie, the Outdoor Enthusiast</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;