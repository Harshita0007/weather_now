import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search, MapPin, Loader2, CloudSnow, CloudDrizzle, CloudFog, X, Thermometer, Activity, Calendar } from 'lucide-react';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Get dynamic background gradient based on weather
  const getBackgroundGradient = () => {
    if (!weather) {
      return 'from-blue-400 via-blue-500 to-purple-600'; // Default
    }

    const code = weather.weather_code;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;

    // Night time (any weather)
    if (isNight) {
      return 'from-indigo-900 via-purple-900 to-gray-900';
    }

    // Clear/Sunny
    if (code === 0 || code === 1) {
      return 'from-yellow-300 via-orange-400 to-red-400';
    }

    // Partly Cloudy
    if (code === 2) {
      return 'from-blue-300 via-blue-400 to-blue-500';
    }

    // Overcast/Cloudy
    if (code === 3) {
      return 'from-gray-400 via-gray-500 to-gray-600';
    }

    // Fog
    if (code === 45 || code === 48) {
      return 'from-gray-300 via-gray-400 to-gray-500';
    }

    // Drizzle
    if (code >= 51 && code <= 55) {
      return 'from-slate-400 via-slate-500 to-slate-600';
    }

    // Rain
    if (code >= 61 && code <= 67) {
      return 'from-slate-600 via-slate-700 to-slate-800';
    }

    // Snow
    if (code >= 71 && code <= 77) {
      return 'from-blue-200 via-blue-300 to-blue-400';
    }

    // Rain showers
    if (code >= 80 && code <= 82) {
      return 'from-blue-600 via-blue-700 to-gray-700';
    }

    // Snow showers
    if (code >= 85 && code <= 86) {
      return 'from-cyan-300 via-blue-400 to-indigo-500';
    }

    // Thunderstorm
    if (code >= 95 && code <= 99) {
      return 'from-gray-700 via-gray-800 to-gray-900';
    }

    // Default
    return 'from-blue-400 via-blue-500 to-purple-600';
  };

  useEffect(() => {
    if (city.length >= 2) {
      const timer = setTimeout(() => {
        fetchCitySuggestions(city);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [city]);

  const fetchCitySuggestions = async (searchTerm) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=10&language=en&format=json`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const uniqueCities = [];
        const seen = new Set();

        for (const city of data.results) {
          const key = `${city.name}-${city.country}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueCities.push(city);
            if (uniqueCities.length >= 5) break;
          }
        }

        setSuggestions(uniqueCities);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setCity(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);

    // Start loading immediately for better UX
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);

    await fetchWeatherForCity(suggestion.latitude, suggestion.longitude, suggestion.name, suggestion.country);
  };

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

  const getWeatherIcon = (code, size = "w-16 h-16") => {
    if (code === 0 || code === 1) return <Sun className={`${size} text-yellow-400`} />;
    if (code === 2 || code === 3) return <Cloud className={`${size} text-gray-400`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${size} text-gray-500`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${size} text-blue-400`} />;
    if (code >= 61 && code <= 67) return <CloudRain className={`${size} text-blue-500`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${size} text-blue-300`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${size} text-blue-600`} />;
    if (code >= 85 && code <= 86) return <CloudSnow className={`${size} text-blue-400`} />;
    return <Cloud className={`${size} text-gray-400`} />;
  };

  const getCityCoordinates = async (cityName) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
    );
    const data = await response.json();

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

  const fetchWeather = async (lat, lon) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );
    const data = await response.json();
    return data;
  };

  const fetchWeatherForCity = async (lat, lon, name, country) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);

    try {
      const weatherData = await fetchWeather(lat, lon);
      setWeather({
        ...weatherData.current,
        cityName: name,
        country: country
      });

      // Set 7-day forecast
      if (weatherData.daily) {
        const forecastData = weatherData.daily.time.slice(1, 8).map((date, index) => ({
          date: date,
          weatherCode: weatherData.daily.weather_code[index + 1],
          maxTemp: weatherData.daily.temperature_2m_max[index + 1],
          minTemp: weatherData.daily.temperature_2m_min[index + 1],
          precipitation: weatherData.daily.precipitation_probability_max[index + 1]
        }));
        setForecast(forecastData);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);
    setShowSuggestions(false);

    try {
      const coords = await getCityCoordinates(city);
      await fetchWeatherForCity(coords.lat, coords.lon, coords.name, coords.country);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      handleSearch();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getCardDetails = (cardType) => {
    if (!weather) return null;

    const details = {
      humidity: {
        title: 'Humidity Details',
        icon: <Droplets className="w-12 h-12 text-blue-400" />,
        mainValue: `${weather.relative_humidity_2m}%`,
        description: 'Current relative humidity in the atmosphere',
        details: [
          { label: 'Comfort Level', value: weather.relative_humidity_2m > 70 ? 'High' : weather.relative_humidity_2m > 40 ? 'Comfortable' : 'Low' },
          { label: 'Type', value: weather.relative_humidity_2m > 60 ? 'Humid' : 'Dry' },
          { label: 'Impact', value: weather.relative_humidity_2m > 70 ? 'May feel warmer' : 'Good for outdoor activities' }
        ]
      },
      wind: {
        title: 'Wind Details',
        icon: <Wind className="w-12 h-12 text-blue-400" />,
        mainValue: `${Math.round(weather.wind_speed_10m)} km/h`,
        description: 'Wind speed measured at 10 meters height',
        details: [
          { label: 'Direction', value: `${weather.wind_direction_10m}° (${getWindDirection(weather.wind_direction_10m)})` },
          { label: 'Strength', value: getWindStrength(weather.wind_speed_10m) },
          { label: 'Conditions', value: weather.wind_speed_10m > 30 ? 'Windy' : weather.wind_speed_10m > 15 ? 'Breezy' : 'Calm' }
        ]
      },
      direction: {
        title: 'Wind Direction Details',
        icon: <Gauge className="w-12 h-12 text-blue-400" />,
        mainValue: `${weather.wind_direction_10m}°`,
        description: 'Wind direction in degrees from north',
        details: [
          { label: 'Cardinal Direction', value: getWindDirection(weather.wind_direction_10m) },
          { label: 'Wind Speed', value: `${Math.round(weather.wind_speed_10m)} km/h` },
          { label: 'Wind Type', value: getWindStrength(weather.wind_speed_10m) }
        ]
      },
      condition: {
        title: 'Weather Condition Details',
        icon: <Activity className="w-12 h-12 text-blue-400" />,
        mainValue: getWeatherDescription(weather.weather_code),
        description: 'Current weather conditions',
        details: [
          { label: 'WMO Code', value: weather.weather_code },
          { label: 'Temperature', value: `${Math.round(weather.temperature_2m)}°C` },
          { label: 'Feels Like', value: `${Math.round(weather.apparent_temperature)}°C` }
        ]
      }
    };

    return details[cardType];
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getWindStrength = (speed) => {
    if (speed < 5) return 'Calm';
    if (speed < 15) return 'Light breeze';
    if (speed < 30) return 'Moderate';
    if (speed < 50) return 'Strong';
    return 'Very strong';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} p-4 sm:p-6 md:p-8 transition-all duration-1000`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 sm:mb-4">
            Weather Now
          </h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg">
            Check current weather conditions for any city
          </p>
        </div>

        <div className="mb-8 relative">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow click events to fire
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter city name (e.g., London, Tokyo, New York)"
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl text-base sm:text-lg bg-white/90 backdrop-blur-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/50 transition-all"
                autoComplete="off"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden z-20 max-h-80 overflow-y-auto animate-fadeIn">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.name}-${suggestion.country}-${index}`}
                      onMouseDown={(e) => {
                        // Use onMouseDown instead of onClick for better responsiveness
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      className="px-4 py-3 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{suggestion.name}</div>
                          <div className="text-sm text-gray-500">
                            {suggestion.country}
                            {suggestion.admin1 && ` • ${suggestion.admin1}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
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

        {error && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl mb-8 text-center">
            {error}
          </div>
        )}

        {weather && (
          <div className="space-y-6">
            {/* Current Weather */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">
                  {weather.cityName}
                </h2>
                <p className="text-blue-100 text-lg sm:text-xl">{weather.country}</p>
              </div>

              <div className="flex flex-col items-center mb-8 sm:mb-12">
                <div className="mb-4 sm:mb-6">
                  {getWeatherIcon(weather.weather_code)}
                </div>
                <div className="text-6xl sm:text-7xl md:text-8xl font-bold mb-2 sm:mb-4">
                  {Math.round(weather.temperature_2m)}°C
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl text-blue-100 mb-2">
                  {getWeatherDescription(weather.weather_code)}
                </div>
                <div className="text-base sm:text-lg text-blue-200">
                  Feels like {Math.round(weather.apparent_temperature)}°C
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div
                  onClick={() => setSelectedCard('humidity')}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <Droplets className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {weather.relative_humidity_2m}%
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200">Humidity</div>
                </div>

                <div
                  onClick={() => setSelectedCard('wind')}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <Wind className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {Math.round(weather.wind_speed_10m)}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200">km/h</div>
                </div>

                <div
                  onClick={() => setSelectedCard('direction')}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <Gauge className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                  <div className="text-2xl sm:text-3xl font-bold mb-1">
                    {weather.wind_direction_10m}°
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200">Direction</div>
                </div>

                <div
                  onClick={() => setSelectedCard('condition')}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:bg-white/20 transition-all transform hover:scale-105"
                >
                  <Eye className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-200" />
                  <div className="text-lg sm:text-xl font-bold mb-1">
                    {getWeatherDescription(weather.weather_code)}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200">Condition</div>
                </div>
              </div>

              <div className="text-center mt-6 sm:mt-8 text-blue-200 text-xs sm:text-sm">
                Last updated: {new Date(weather.time).toLocaleString()}
              </div>
            </div>

            {/* 7-Day Forecast */}
            {forecast && forecast.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-200" />
                  <h3 className="text-2xl sm:text-3xl font-bold">7-Day Forecast</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/20 transition-all"
                    >
                      <div className="font-semibold text-lg mb-3">
                        {getDayName(day.date)}
                      </div>
                      <div className="mb-3 flex justify-center">
                        {getWeatherIcon(day.weatherCode, "w-10 h-10")}
                      </div>
                      <div className="space-y-1">
                        <div className="text-xl font-bold">
                          {Math.round(day.maxTemp)}°
                        </div>
                        <div className="text-sm text-blue-200">
                          {Math.round(day.minTemp)}°
                        </div>
                      </div>
                      {day.precipitation > 0 && (
                        <div className="mt-2 text-xs text-blue-200">
                          💧 {day.precipitation}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="text-center text-white/80 mt-12 sm:mt-16">
            <Cloud className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 opacity-50" />
            <p className="text-lg sm:text-xl md:text-2xl mb-4">
              Enter a city name to check the weather
            </p>
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12 text-white/60 text-xs sm:text-sm">
          <p>Powered by Open-Meteo API</p>
          <p className="mt-2">Built for Jamie, the Outdoor Enthusiast</p>
        </div>
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {getCardDetails(selectedCard)?.icon}
                <h3 className="text-2xl font-bold text-gray-800">
                  {getCardDetails(selectedCard)?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {getCardDetails(selectedCard)?.mainValue}
              </div>
              <p className="text-gray-600">
                {getCardDetails(selectedCard)?.description}
              </p>
            </div>

            <div className="space-y-4">
              {getCardDetails(selectedCard)?.details.map((detail, index) => (
                <div key={index} className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">{detail.label}</div>
                  <div className="text-lg font-semibold text-gray-800">{detail.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;