import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import { format, addDays } from 'date-fns';
import Chart from 'react-apexcharts';

const Weather = () => {
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('Farm Location');

  useEffect(() => {
    // Simulate loading weather data
    const loadWeatherData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock current weather
      setCurrentWeather({
        temperature: 72,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        windDirection: 'NW',
        pressure: 30.15,
        uvIndex: 6,
        visibility: 10,
        dewPoint: 58,
        feelsLike: 75
      });
      
      // Mock 7-day forecast
      const mockForecast = [
        { day: 'Today', icon: 'Sun', high: 75, low: 58, condition: 'Sunny', precipitation: 0, humidity: 45 },
        { day: 'Tomorrow', icon: 'CloudRain', high: 68, low: 52, condition: 'Light Rain', precipitation: 80, humidity: 75 },
        { day: 'Wednesday', icon: 'Cloud', high: 65, low: 48, condition: 'Cloudy', precipitation: 20, humidity: 60 },
        { day: 'Thursday', icon: 'Sun', high: 73, low: 55, condition: 'Sunny', precipitation: 0, humidity: 40 },
        { day: 'Friday', icon: 'CloudRain', high: 70, low: 56, condition: 'Showers', precipitation: 90, humidity: 80 },
        { day: 'Saturday', icon: 'Sun', high: 76, low: 59, condition: 'Partly Sunny', precipitation: 10, humidity: 50 },
        { day: 'Sunday', icon: 'CloudSnow', high: 64, low: 45, condition: 'Rain/Snow', precipitation: 70, humidity: 85 }
      ];
      
      setForecast(mockForecast.map((day, index) => ({
        ...day,
        date: addDays(new Date(), index)
      })));
      
      setLoading(false);
    };
    
    loadWeatherData();
  }, []);

  // Chart data for temperature trend
  const temperatureChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#2D5016', '#7CB342'],
    xaxis: {
      categories: forecast.map(day => format(day.date, 'EEE')),
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { text: 'Temperature (°F)' }
    },
    grid: {
      borderColor: '#f1f1f1'
    },
    legend: {
      position: 'top'
    }
  };

  const temperatureChartSeries = [
    {
      name: 'High',
      data: forecast.map(day => day.high)
    },
    {
      name: 'Low', 
      data: forecast.map(day => day.low)
    }
  ];

  // Chart data for precipitation
  const precipitationChartOptions = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    },
    colors: ['#1976D2'],
    xaxis: {
      categories: forecast.map(day => format(day.date, 'EEE')),
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { text: 'Precipitation (%)' },
      max: 100
    },
    grid: {
      borderColor: '#f1f1f1'
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%'
      }
    }
  };

  const precipitationChartSeries = [{
    name: 'Chance of Rain',
    data: forecast.map(day => day.precipitation)
  }];

  if (loading) return <Loading />;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Weather</h1>
          <p className="text-gray-600 mt-1">
            Current conditions and forecast for your farming area
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="input-field"
          >
            <option value="Farm Location">Farm Location</option>
            <option value="North Field">North Field</option>
            <option value="South Field">South Field</option>
            <option value="Greenhouse">Greenhouse</option>
          </select>
        </div>
      </div>

      {/* Current Weather */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Weather Info */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <ApperIcon name="Sun" className="h-16 w-16 text-white" />
              <div>
                <h2 className="text-4xl font-bold">{currentWeather?.temperature}°F</h2>
                <p className="text-xl text-blue-100">{currentWeather?.condition}</p>
                <p className="text-blue-200">Feels like {currentWeather?.feelsLike}°F</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200">Wind</p>
                <p className="font-semibold">{currentWeather?.windSpeed} mph {currentWeather?.windDirection}</p>
              </div>
              <div>
                <p className="text-blue-200">Humidity</p>
                <p className="font-semibold">{currentWeather?.humidity}%</p>
              </div>
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <div>
                <p className="text-blue-200">Pressure</p>
                <p className="font-semibold">{currentWeather?.pressure} in</p>
              </div>
              <div>
                <p className="text-blue-200">UV Index</p>
                <p className="font-semibold">{currentWeather?.uvIndex} (High)</p>
              </div>
              <div>
                <p className="text-blue-200">Visibility</p>
                <p className="font-semibold">{currentWeather?.visibility} mi</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-blue-200">Dew Point</p>
                <p className="font-semibold">{currentWeather?.dewPoint}°F</p>
              </div>
              <div>
                <p className="text-blue-200">Location</p>
                <p className="font-semibold">{selectedLocation}</p>
              </div>
              <div>
                <p className="text-blue-200">Last Updated</p>
                <p className="font-semibold">{format(new Date(), 'h:mm a')}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 7-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 mb-2">
                {index === 0 ? 'Today' : format(day.date, 'EEE')}
              </p>
              <div className="flex justify-center mb-3">
                <ApperIcon name={day.icon} className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">{day.high}°</p>
                <p className="text-sm text-gray-600">{day.low}°</p>
                <p className="text-xs text-gray-500">{day.condition}</p>
                {day.precipitation > 0 && (
                  <p className="text-xs text-blue-600">{day.precipitation}% rain</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature Trend</h3>
          <Chart
            options={temperatureChartOptions}
            series={temperatureChartSeries}
            type="line"
            height={300}
          />
        </motion.div>

        {/* Precipitation Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Precipitation Forecast</h3>
          <Chart
            options={precipitationChartOptions}
            series={precipitationChartSeries}
            type="bar"
            height={250}
          />
        </motion.div>
      </div>

      {/* Weather Alerts & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card border-l-4 border-amber-500"
        >
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weather Alert</h3>
              <p className="text-gray-600 mb-3">
                Heavy rain expected tomorrow afternoon. Consider postponing outdoor activities and ensure proper drainage.
              </p>
              <div className="flex items-center text-sm text-amber-600">
                <ApperIcon name="Clock" className="h-4 w-4 mr-1" />
                <span>Active until tomorrow 6 PM</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Farming Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card border-l-4 border-green-500"
        >
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <ApperIcon name="Lightbulb" className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Farming Tip</h3>
              <p className="text-gray-600 mb-3">
                With the upcoming rain, it's an ideal time to apply fertilizer before the natural watering occurs.
              </p>
              <div className="flex items-center text-sm text-green-600">
                <ApperIcon name="CheckCircle" className="h-4 w-4 mr-1" />
                <span>Best time: This afternoon</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Weather;