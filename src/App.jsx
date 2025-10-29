import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Search, MapPin, Loader2, CloudSnow, CloudDrizzle, CloudFog, X, Thermometer, Activity, Calendar, Sunrise, Sunset, TrendingUp, TrendingDown } from 'lucide-react';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Get dynamic background gradient based on weather
  const getBackgroundGradient = () => {
    if (!weather) {
      return 'from-blue-400 via-blue-500 to-purple-600'; // Default
    }

    const code = weather.weather_code;
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;

    if (isNight) {
      return 'from-indigo-900 via-purple-900 to-gray-900';
    }

    if (code === 0 || code === 1) {
      return 'from-yellow-300 via-orange-400 to-red-400';
    }

    if (code === 2) {
      return 'from-blue-300 via-blue-400 to-blue-500';
    }

    if (code === 3) {
      return 'from-gray-400 via-gray-500 to-gray-600';
    }

    if (code === 45 || code === 48) {
      return 'from-gray-300 via-gray-400 to-gray-500';
    }

    if (code >= 51 && code <= 55) {
      return 'from-slate-400 via-slate-500 to-slate-600';
    }

    if (code >= 61 && code <= 67) {
      return 'from-slate-600 via-slate-700 to-slate-800';
    }

    if (code >= 71 && code <= 77) {
      return 'from-blue-200 via-blue-300 to-blue-400';
    }

    if (code >= 80 && code <= 82) {
      return 'from-blue-600 via-blue-700 to-gray-700';
    }

    if (code >= 85 && code <= 86) {
      return 'from-cyan-300 via-blue-400 to-indigo-500';
    }

    if (code >= 95 && code <= 99) {
      return 'from-gray-700 via-gray-800 to-gray-900';
    }

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
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`
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

      if (weatherData.daily) {
        const forecastData = weatherData.daily.time.slice(1, 8).map((date, index) => ({
          date: date,
          weatherCode: weatherData.daily.weather_code[index + 1],
          maxTemp: weatherData.daily.temperature_2m_max[index + 1],
          minTemp: weatherData.daily.temperature_2m_min[index + 1],
          precipitation: weatherData.daily.precipitation_probability_max[index + 1],
          windSpeed: weatherData.daily.wind_speed_10m_max[index + 1]
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getShortDayName = (dateString) => {
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
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
            Weather Now
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl font-medium">
            Check current weather conditions for any city worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative animate-slide-up">
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
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Enter city name (e.g., London, Tokyo, New York)"
                className="w-full pl-12 pr-4 py-4 sm:py-5 rounded-2xl text-base sm:text-lg bg-white/95 backdrop-blur-md focus:bg-white focus:outline-none focus:ring-4 focus:ring-white/60 transition-all shadow-xl"
                autoComplete="off"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.name}-${suggestion.country}-${index}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                      className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 active:bg-blue-100 cursor-pointer transition-all border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-lg">{suggestion.name}</div>
                          <div className="text-sm text-gray-500 font-medium">
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
              className="bg-white text-blue-600 px-8 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading</span>
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
          <div className="bg-red-500/95 backdrop-blur-md text-white px-6 py-5 rounded-2xl mb-8 text-center font-semibold shadow-xl animate-shake">
            ⚠️ {error}
          </div>
        )}

        {weather && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Current Weather Card - Compact */}
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Main Weather Info */}
                <div className="text-center md:text-left">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                    {weather.cityName}
                  </h2>
                  <p className="text-white/90 text-lg sm:text-xl font-medium mb-4">{weather.country}</p>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                    <div className="transform hover:scale-110 transition-transform duration-300">
                      {getWeatherIcon(weather.weather_code, "w-20 h-20 sm:w-24 sm:h-24")}
                    </div>
                    <div>
                      <div className="text-6xl sm:text-7xl font-bold mb-2 drop-shadow-2xl">
                        {Math.round(weather.temperature_2m)}°C
                      </div>
                      <div className="text-xl sm:text-2xl text-white/95 mb-1 font-semibold">
                        {getWeatherDescription(weather.weather_code)}
                      </div>
                      <div className="text-base sm:text-lg text-white/80 font-medium">
                        Feels like {Math.round(weather.apparent_temperature)}°C
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Weather Stats Grid - Compact */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div
                    onClick={() => setSelectedCard('humidity')}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center cursor-pointer hover:bg-white/25 active:bg-white/30 transition-all transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                  >
                    <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {weather.relative_humidity_2m}%
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold">Humidity</div>
                  </div>

                  <div
                    onClick={() => setSelectedCard('wind')}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center cursor-pointer hover:bg-white/25 active:bg-white/30 transition-all transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                  >
                    <Wind className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {Math.round(weather.wind_speed_10m)}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold">km/h</div>
                  </div>

                  <div
                    onClick={() => setSelectedCard('direction')}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center cursor-pointer hover:bg-white/25 active:bg-white/30 transition-all transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                  >
                    <Gauge className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {weather.wind_direction_10m}°
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold">Direction</div>
                  </div>

                  <div
                    onClick={() => setSelectedCard('condition')}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center cursor-pointer hover:bg-white/25 active:bg-white/30 transition-all transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                  >
                    <Eye className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <div className="text-base sm:text-lg font-bold mb-1 line-clamp-2">
                      {getWeatherDescription(weather.weather_code)}
                    </div>
                    <div className="text-xs sm:text-sm text-white/80 font-semibold">Condition</div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 text-white/70 text-xs font-medium">
                Last updated: {new Date(weather.time).toLocaleString()}
              </div>
            </div>

            {/* 7-Day Forecast - More Compact */}
            {forecast && forecast.length > 0 && (
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 sm:p-6 text-white shadow-2xl border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">7-Day Forecast</h3>
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedDay(day)}
                      className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center cursor-pointer hover:bg-white/25 active:bg-white/30 transition-all transform hover:scale-105 active:scale-95 border border-white/20 shadow-lg"
                    >
                      <div className="font-bold text-xs sm:text-sm mb-2">
                        {getShortDayName(day.date).slice(0, 3)}
                      </div>
                      <div className="mb-2 flex justify-center transform hover:scale-110 transition-transform">
                        {getWeatherIcon(day.weatherCode, "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10")}
                      </div>
                      <div className="space-y-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold">
                          {Math.round(day.maxTemp)}°
                        </div>
                        <div className="text-xs sm:text-sm text-white/80">
                          {Math.round(day.minTemp)}°
                        </div>
                      </div>
                      {day.precipitation > 0 && (
                        <div className="mt-1 text-xs text-blue-200">
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

        {/* Empty State */}
        {!weather && !loading && !error && (
          <div className="text-center text-white mt-16 sm:mt-20 animate-fade-in">
            <div className="mb-8 flex justify-center">
              <Cloud className="w-24 h-24 sm:w-32 sm:h-32 opacity-60 animate-float" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Discover Weather Anywhere
            </p>
            <p className="text-lg sm:text-xl text-white/80 font-medium">
              Enter a city name to get started
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-white/70 text-sm font-medium">
          <p className="mt-2">Built for Jamie, the Outdoor Enthusiast 🏔️</p>
        </div>
      </div>

      {/* Current Weather Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform animate-scale-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getCardDetails(selectedCard)?.icon}
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                  {getCardDetails(selectedCard)?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-2 sm:mb-3">
                {getCardDetails(selectedCard)?.mainValue}
              </div>
              <p className="text-gray-600 text-base sm:text-lg px-2">
                {getCardDetails(selectedCard)?.description}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {getCardDetails(selectedCard)?.details.map((detail, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-blue-100">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 font-semibold">{detail.label}</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-800 break-words">{detail.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Forecast Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl transform animate-scale-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 flex-shrink-0" />
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
                  {getDayName(selectedDay.date)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <div className="mb-4 sm:mb-6 flex justify-center">
                {getWeatherIcon(selectedDay.weatherCode, "w-20 h-20 sm:w-24 sm:h-24")}
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2 sm:mb-3 px-2">
                {getWeatherDescription(selectedDay.weatherCode)}
              </div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg px-2">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-gray-600 font-semibold">High Temperature</div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-800">{Math.round(selectedDay.maxTemp)}°C</div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 sm:p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                  <div className="text-xs sm:text-sm text-gray-600 font-semibold">Low Temperature</div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-800">{Math.round(selectedDay.minTemp)}°C</div>
              </div>

              {selectedDay.precipitation > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold">Precipitation Chance</div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">{selectedDay.precipitation}%</div>
                </div>
              )}

              {selectedDay.windSpeed && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-5 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold">Max Wind Speed</div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">{Math.round(selectedDay.windSpeed)} km/h</div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-green-100">
                <div className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Recommendation</div>
                <div className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                  {selectedDay.precipitation > 70 ? '🌧️ Heavy rain expected. Carry an umbrella!' :
                    selectedDay.precipitation > 40 ? '☔ Possible rain. Keep an umbrella handy.' :
                      selectedDay.maxTemp > 30 ? '☀️ Hot day ahead. Stay hydrated!' :
                        selectedDay.maxTemp < 10 ? '🧥 Cold day. Dress warmly!' :
                          selectedDay.windSpeed > 30 ? '💨 Windy conditions. Secure loose items.' :
                            '✨ Great day for outdoor activities!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WeatherApp;