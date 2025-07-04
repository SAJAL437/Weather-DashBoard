import React, { useEffect, useState, useMemo } from "react";
import { CgSearch } from "react-icons/cg";
import axios from "axios";
import debounce from "lodash.debounce";
import { WiCloudRefresh } from "react-icons/wi";

// Custom weather icon mapping
const weatherIcons = {
  Sunny: "/icons/sun.png",
  "Clear ": "/icons/sun.png",
  "Partly Cloudy ": "/icons/clouds.png",
  "Partly Cloudy": "/icons/clouds.png",
  "Cloudy ": "/icons/cloudy.png",
  Overcast: "/icons/overcast.png",
  Mist: "/icons/mist.png",
  Fog: "/icons/foggy.png",
  Rain: "/icons/rainy-day.png",
  "Light rain": "/icons/rain.png",
  "Moderate rain": "/icons/rain.png",
  "Heavy rain": "/icons/heavy-rain.png",
  "Light drizzle": "/icons/rain.png",
  "Patchy rain nearby": "/icons/rainy-day.png",
  "Patchy light drizzle": "/icons/rain.png",
  "Patchy light rain": "/icons/rain.png",
  "Patchy light rain with thunder": "/icons/thunder-rain.png",
  "Moderate or heavy rain shower": "/icons/rainy-day.png",
  "Torrential rain shower": "/icons/rainy-day.png",
  Snow: "/icons/snow.png",
  "Light snow ": "/icons/snow.png",
  "Patchy light snow": "/icons/snow.png",
  "Moderate snow": "/icons/snow.png",
  "Moderate or heavy rain with thunder": "/icons/thunder-rain.png",
  "Heavy snow": "/icons/snow.png",
  Blizzard: "/icons/snow.png",
  Thunderstorm: "/icons/thunderstorm.png",
  "Thundery outbreaks in nearby": "/icons/thunderstorm.png",
  "Patchy sleet nearby": "/icons/sleet.png",
  "Light sleet": "/icons/sleet.png",
  "Moderate or heavy sleet": "/icons/sleet.png",
  "Ice pellets": "/icons/sleet.png",
  "Patchy freezing drizzle nearby": "/icons/freezing-drizzle.png",
  "Freezing drizzle": "/icons/freezing-drizzle.png",
  "Heavy freezing drizzle": "/icons/freezing-drizzle.png",
};

// Dynamic background gradients based on weather condition
const weatherBackgrounds = {
  Sunny: "from-yellow-100 to-orange-200",
  Clear: "from-blue-100 to-blue-300",
  "Partly cloudy": "from-gray-100 to-gray-300",
  Cloudy: "from-gray-200 to-gray-400",
  Overcast: "from-gray-300 to-gray-500",
  Mist: "from-gray-200 to-gray-300",
  Rain: "from-blue-200 to-blue-400",
  "Light rain": "from-blue-200 to-blue-400",
  "Moderate rain": "from-blue-300 to-blue-500",
  "Heavy rain": "from-blue-400 to-blue-600",
  Snow: "from-blue-100 to-gray-200",
  Fog: "from-gray-200 to-gray-300",
  Thunderstorm: "from-gray-400 to-gray-600",
};

const mainCities = ["New Delhi", "Lucknow", "Paris", "Washington", "Kathmandu"];

const Weather = () => {
  const [data, setData] = useState(null);
  const [place, setPlace] = useState("New Delhi");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("celsius");
  const [forecastType, setForecastType] = useState("hourly");
  const [citiesData, setCitiesData] = useState({});
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(null);

  const fetchWeatherData = async (location) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=da6e20d39b1543479a1200232242110&q=${location}&aqi=yes&days=7`
      );
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.status === 400
          ? "Invalid location. Please enter a valid city."
          : "Failed to fetch weather data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.weatherapi.com/v1/forecast.json?key=da6e20d39b1543479a1200232242110&q=${latitude},${longitude}&days=7&aqi=yes`
          );
          setData(response.data);
          setPlace(response.data.location.name);
        } catch (err) {
          setError("Failed to fetch weather for current location.");
          console.log(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Permission denied. Unable to fetch your location.");
        setLoading(false);
      }
    );
  };

  const fetchMainCitiesData = async () => {
    setCitiesError(null);
    setCitiesLoading(true);
    try {
      const responses = await Promise.all(
        mainCities.map((city) =>
          axios.get(
            `https://api.weatherapi.com/v1/current.json?key=da6e20d39b1543479a1200232242110&q=${city}&aqi=yes`
          )
        )
      );
      const newCitiesData = responses.reduce((acc, response, index) => {
        acc[mainCities[index]] = response.data;
        return acc;
      }, {});
      setCitiesData(newCitiesData);
    } catch (err) {
      setCitiesError("Failed to fetch city data.");
      console.log(err);
    } finally {
      setCitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(place);
  }, [place]);

  useEffect(() => {
    fetchWeatherByCurrentLocation();
    fetchMainCitiesData();
  }, []);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          setPlace(value.trim());
        }
      }, 500),
    []
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue.trim()) {
      setPlace(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      setPlace(inputValue.trim());
      setInputValue("");
    }
  };

  const toggleUnit = () => {
    setUnit(unit === "celsius" ? "fahrenheit" : "celsius");
  };

  const toggleForecastType = () => {
    setForecastType(forecastType === "hourly" ? "daily" : "hourly");
  };

  const handleRefresh = () => {
    fetchWeatherData(place);
  };

  const getWeatherIcon = (condition) => {
    return weatherIcons[condition] || "/icons/default.png";
  };

  const getWeatherBackground = (condition) => {
    return weatherBackgrounds[condition] || "from-blue-100 to-blue-500";
  };

  const formatDate = useMemo(
    () => (localtime) => {
      if (!localtime) return { day: "", date: "", time: "" };
      const date = new Date(localtime);
      return {
        day: date.toLocaleString("en-US", { weekday: "long" }),
        date: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        time: date.toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    },
    []
  );

  const getNext24Hours = useMemo(
    () => (forecastData, localtime) => {
      if (!forecastData || !forecastData.forecastday || !localtime) return [];
      const currentTime = new Date(localtime);
      const currentHour = currentTime.getHours();
      const currentDay = forecastData.forecastday[0];
      const nextDay = forecastData.forecastday[1] || { hour: [] };

      const currentDayHours = currentDay.hour.slice(currentHour);
      const remainingHoursNeeded = 24 - currentDayHours.length;
      const nextDayHours =
        remainingHoursNeeded > 0
          ? nextDay.hour.slice(0, remainingHoursNeeded)
          : [];

      return [...currentDayHours, ...nextDayHours];
    },
    []
  );

  return (
    <div className="min-h-screen p-2  bg-gray-50">
      <div
        className={`max-w-8xl mx-auto bg-white rounded-2xl shadow-lg bg-gradient-to-br  ${
          data
            ? getWeatherBackground(data.current.condition.text)
            : "from-gray-100 to-gray-300"
        } transition-all duration-500 `}
      >
        <div className="flex justify-center text-center py-4 sm:py-6">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-800">
            Weather Dashboard
          </h1>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 p-4 sm:p-6">
          <div className={`w-full lg:w-1/3 p-4 sm:p-6 `}>
            <div className="relative mb-4 sm:mb-6">
              <div className="flex border border-gray-300 bg-white/90 backdrop-blur-sm rounded-full h-10 sm:h-12 items-center space-x-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input
                  type="text"
                  className="pl-4 w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search city..."
                  aria-label="Search for a city"
                />
                <button
                  className="text-gray-600 hover:text-blue-600 pr-3 transition-colors"
                  onClick={handleButtonClick}
                  aria-label="Search"
                >
                  <CgSearch size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="relative group">
                <button
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-gray-800 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  onClick={toggleUnit}
                  aria-label={`Switch to ${
                    unit === "celsius" ? "Fahrenheit" : "Celsius"
                  }`}
                >
                  Switch to {unit === "celsius" ? "°F" : "°C"}
                </button>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  Toggle temperature unit
                </span>
              </div>
              <div className="relative group">
                <button
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={handleRefresh}
                  aria-label="Refresh weather data"
                >
                  <WiCloudRefresh size={20} className="sm:w-6 sm:h-6" />
                </button>
                <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  Refresh data
                </span>
              </div>
            </div>

            {error && (
              <div className="relative bg-red-100/90 backdrop-blur-sm text-red-600 text-center mb-4 sm:mb-6 text-xs sm:text-sm font-medium p-3 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button
                  className="text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center space-y-4 animate-pulse">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gray-200 rounded-full"></div>
                <div className="w-24 sm:w-32 h-5 sm:h-6 bg-gray-200 rounded"></div>
                <div className="w-36 sm:w-48 h-8 sm:h-10 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-200/80 rounded-xl p-3"
                    >
                      <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gray-300 rounded mr-2 sm:mr-3"></div>
                      <div className="space-y-2">
                        <div className="w-12 sm:w-16 h-3 bg-gray-300 rounded"></div>
                        <div className="w-16 sm:w-24 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : data ? (
              <div className="flex flex-col items-center space-y-4 sm:space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={getWeatherIcon(data.current.condition.text)}
                    alt={data.current.condition.text}
                    className="w-16 sm:w-20 h-16 sm:h-20"
                  />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center">
                    {data.location.name}, {data.location.country}
                  </h2>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
                    {unit === "celsius"
                      ? data.current.temp_c
                      : data.current.temp_f}
                    <span className="text-xl sm:text-2xl md:text-3xl">
                      °{unit === "celsius" ? "C" : "F"}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg mt-2 font-medium">
                    {data.current.condition.text}
                  </p>
                </div>
                <div className="w-full border-t border-gray-300 pt-3 sm:pt-4">
                  <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                    Today
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                        {formatDate(data.location.localtime).day}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        {formatDate(data.location.localtime).date}
                      </p>
                    </div>
                    <p className="text-sm sm:text-lg font-medium text-gray-600">
                      {formatDate(data.location.localtime).time}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                  {[
                    {
                      icon: getWeatherIcon(data.current.condition.text),
                      label: "Condition",
                      value: data.current.condition.text,
                    },
                    {
                      icon: "/icons/humidity.png",
                      label: "Humidity",
                      value: `${data.current.humidity}%`,
                    },
                    {
                      icon: "/icons/wind.png",
                      label: "Detecting Wind",
                      value: `${data.current.wind_kph} km/h`,
                    },
                    {
                      icon: "/icons/pressure.png",
                      label: "Pressure",
                      value: `${data.current.pressure_mb} mb`,
                    },
                  ].map(({ icon, label, value }, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 hover:shadow-md transition-all"
                    >
                      <img
                        src={icon}
                        alt={`${label} icon`}
                        className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3"
                      />
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                          {label}
                        </p>
                        <p className="text-gray-800 text-xs sm:text-sm font-bold">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm sm:text-base font-medium">
                No data available
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 sm:p-6 bg-white/30 backdrop-blur-2xl rounded-2xl shadow-lg">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-200/80 rounded-xl p-3"
                    >
                      <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gray-300 rounded mr-2 sm:mr-3"></div>
                      <div className="space-y-2">
                        <div className="w-12 sm:w-16 h-3 bg-gray-300 rounded"></div>
                        <div className="w-16 sm:w-24 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : data ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    {
                      icon: "/icons/air-quality.png",
                      label: "AQI",
                      value:
                        data.current.air_quality?.["us-epa-index"] || "N/A",
                    },
                    {
                      icon: "/icons/sunrise.png",
                      label: "Sunrise",
                      value:
                        data.forecast.forecastday[0].astro.sunrise || "N/A",
                    },
                    {
                      icon: "/icons/sunset.png",
                      label: "Sunset",
                      value: data.forecast.forecastday[0].astro.sunset || "N/A",
                    },
                    {
                      icon: "/icons/uv-protection.png",
                      label: "UV Index",
                      value: data.current.uv || "N/A",
                    },
                    {
                      icon: "/icons/tempreature.png",
                      label: "Max/Min Temp",
                      value: `${
                        unit === "celsius"
                          ? data.forecast.forecastday[0].day.maxtemp_c
                          : data.forecast.forecastday[0].day.maxtemp_f
                      }° / ${
                        unit === "celsius"
                          ? data.forecast.forecastday[0].day.mintemp_c
                          : data.forecast.forecastday[0].day.mintemp_f
                      }°`,
                    },
                    {
                      icon: "/icons/wind-turbine.png",
                      label: "Max Wind",
                      value: `${
                        unit === "celsius"
                          ? data.forecast.forecastday[0].day.maxwind_kph
                          : data.forecast.forecastday[0].day.maxwind_mph
                      } ${unit === "celsius" ? "km/h" : "mph"}`,
                    },
                  ].map(({ icon, label, value }, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white/90 backdrop-blur-lg rounded-lg p-2 sm:p-3 hover:shadow-md transition-all"
                    >
                      <img
                        src={icon}
                        alt={`${label} icon`}
                        className="w-5 sm:w-6 h-5 sm:h-6 mr-2 sm:mr-3"
                      />
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-semibold">
                          {label}
                        </p>
                        <p className="text-gray-800 text-xs sm:text-sm font-bold">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  No data available
                </p>
              )}
            </div>

            <div className="p-4  bg-white/30 backdrop-blur-2xl  rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {forecastType === "hourly"
                    ? "Hourly Forecast "
                    : "Daily Forecast"}
                </h3>
                <div className="relative group">
                  <button
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-gray-800 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    onClick={toggleForecastType}
                    aria-label={`Switch to ${
                      forecastType === "hourly" ? "Daily" : "Hourly"
                    } Forecast`}
                  >
                    Show {forecastType === "hourly" ? "Daily" : "Hourly"}
                  </button>
                </div>
              </div>
              {data ? (
                <div className="animate-fade-in">
                  {forecastType === "hourly" &&
                  data.forecast?.forecastday?.[0]?.hour ? (
                    <div className="relative overflow-hidden">
                      <div
                        className="flex overflow-x-auto gap-2 sm:gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 snap-x snap-mandatory scrollbar-track-gray"
                        style={{ maxWidth: "calc(90px * 8 + 20px * 6)" }}
                      >
                        {getNext24Hours(
                          data.forecast,
                          data.location.localtime
                        ).map((hour, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-lg min-w-[80px] sm:min-w-[90px] hover:shadow-md hover:scale-105 transition-all snap-center"
                          >
                            <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                              {new Date(hour.time).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              })}
                            </p>
                            <img
                              src={getWeatherIcon(hour.condition.text)}
                              alt={hour.condition.text}
                              className="w-6 sm:w-7 h-6 sm:h-7 my-1 sm:my-2"
                            />
                            <p className="text-xs sm:text-sm font-bold text-gray-800">
                              {unit === "celsius" ? hour.temp_c : hour.temp_f}°
                              {unit === "celsius" ? "C" : "F"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : data.forecast?.forecastday ? (
                    <div className="relative overflow-hidden">
                      <div
                        className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 snap-x snap-mandatory"
                        style={{ maxWidth: "calc(100px * 7 + 16px * 6)" }}
                      >
                        {data.forecast.forecastday
                          .slice(0, 9)
                          .map((day, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg min-w-[90px] sm:min-w-[100px] hover:shadow-md hover:scale-105 transition-all snap-center"
                            >
                              <p className="text-xs sm:text-sm text-gray-600 font-semibold">
                                {new Date(day.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    timeZone: "Asia/Kolkata",
                                  }
                                )}
                              </p>
                              <img
                                src={getWeatherIcon(day.day.condition.text)}
                                alt={day.day.condition.text}
                                className="w-7 sm:w-8 h-7 sm:h-8 my-2"
                              />
                              <p className="text-xs sm:text-sm font-bold text-gray-800">
                                {unit === "celsius"
                                  ? day.day.avgtemp_c
                                  : day.day.avgtemp_f}
                                °{unit === "celsius" ? "C" : "F"}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {day.day.condition.text}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base font-medium">
                      No forecast available
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  No forecast available
                </p>
              )}
            </div>
            <div className="p-4 sm:p-6 bg-white/30 backdrop-blur-2xl rounded-2xl shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Capital Weather
              </h3>
              {citiesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
                  {mainCities.map((city) => (
                    <div
                      key={city}
                      className="flex flex-col items-center bg-gray-200/80 p-3 sm:p-4 rounded-lg"
                    >
                      <div className="w-12 sm:w-16 h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gray-300 rounded-full my-2"></div>
                      <div className="w-10 sm:w-12 h-4 bg-gray-300 rounded"></div>
                      <div className="w-16 sm:w-20 h-3 bg-gray-300 rounded mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : citiesError ? (
                <div className="relative bg-red-100/90 backdrop-blur-sm text-red-600 text-center mb-4 text-xs sm:text-sm font-medium p-3 rounded-lg flex items-center justify-between">
                  <span>{citiesError}</span>
                  <button
                    className="text-red-600 hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {mainCities.map((city) => (
                    <div
                      key={city}
                      className={`flex flex-col items-center bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-lg hover:shadow-md hover:scale-105 transition-all cursor-pointer ${
                        place === city ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setPlace(city)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Weather for ${city}`}
                      onKeyDown={(e) => e.key === "Enter" && setPlace(city)}
                    >
                      <p className="text-xs sm:text-sm font-bold text-gray-800">
                        {city}
                      </p>
                      {citiesData[city] ? (
                        <>
                          <img
                            src={getWeatherIcon(
                              citiesData[city].current.condition.text
                            )}
                            alt={citiesData[city].current.condition.text}
                            className="w-7 sm:w-8 h-7 sm:h-8 my-2"
                          />
                          <p className="text-xs sm:text-sm font-bold text-gray-800">
                            {unit === "celsius"
                              ? citiesData[city].current.temp_c
                              : citiesData[city].current.temp_f}
                            °{unit === "celsius" ? "C" : "F"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {citiesData[city].current.condition.text}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          No data
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
