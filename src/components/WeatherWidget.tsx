import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';

interface WeatherDay {
  date: string;
  dayName: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  wind: number;
  humidity: number;
  icon: string;
}

function generateForecast(): WeatherDay[] {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow', 'Windy', 'Clear'];
  const days: WeatherDay[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });

    // Denver March weather patterns
    const baseHigh = 52 + Math.round(Math.random() * 18 - 5);
    const baseLow = 28 + Math.round(Math.random() * 12 - 4);
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName,
      high: baseHigh,
      low: baseLow,
      condition,
      precipitation: condition === 'Rain' ? 40 + Math.round(Math.random() * 50) :
                     condition === 'Snow' ? 30 + Math.round(Math.random() * 40) :
                     Math.round(Math.random() * 20),
      wind: 5 + Math.round(Math.random() * 25),
      humidity: 25 + Math.round(Math.random() * 40),
      icon: condition,
    });
  }
  return days;
}

function WeatherIcon({ condition, className }: { condition: string; className?: string }) {
  switch (condition) {
    case 'Sunny':
    case 'Clear':
      return <Sun className={className || 'w-8 h-8 text-yellow-500'} />;
    case 'Rain':
      return <CloudRain className={className || 'w-8 h-8 text-blue-500'} />;
    case 'Snow':
      return <CloudSnow className={className || 'w-8 h-8 text-blue-300'} />;
    case 'Windy':
      return <Wind className={className || 'w-8 h-8 text-gray-500'} />;
    default:
      return <Cloud className={className || 'w-8 h-8 text-gray-400'} />;
  }
}

function getWorkImpact(day: WeatherDay): { level: 'good' | 'caution' | 'delay'; message: string } {
  if (day.condition === 'Snow' || (day.condition === 'Rain' && day.precipitation > 60)) {
    return { level: 'delay', message: 'Exterior work not recommended' };
  }
  if (day.low < 32 || day.wind > 25 || day.precipitation > 30) {
    return { level: 'caution', message: day.low < 32 ? 'Freezing — concrete/paint restrictions' :
      day.wind > 25 ? 'High winds — no crane/lift work' : 'Rain possible — cover materials' };
  }
  return { level: 'good', message: 'Good conditions for all work' };
}

export default function WeatherWidget() {
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');

  const refreshForecast = () => {
    setForecast(generateForecast());
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  };

  useEffect(() => { refreshForecast(); }, []);

  const today = forecast[0];
  const upcoming = forecast.slice(1);

  if (!today) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Weather Forecast</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Denver, CO — 7-day outlook for scheduling decisions</p>
        </div>
        <button
          onClick={refreshForecast}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Today's weather */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium">Today — {today.date}</p>
            <p className="text-4xl font-bold mt-1">{today.high}°F</p>
            <p className="text-blue-200 mt-1">Low: {today.low}°F</p>
            <p className="text-lg mt-2">{today.condition}</p>
          </div>
          <WeatherIcon condition={today.condition} className="w-16 h-16 text-white/80" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200">Precip</p>
              <p className="font-semibold">{today.precipitation}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200">Wind</p>
              <p className="font-semibold">{today.wind} mph</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-blue-200" />
            <div>
              <p className="text-xs text-blue-200">Humidity</p>
              <p className="font-semibold">{today.humidity}%</p>
            </div>
          </div>
        </div>
        {(() => {
          const impact = getWorkImpact(today);
          return (
            <div className={`mt-4 px-3 py-2 rounded-lg text-sm ${
              impact.level === 'delay' ? 'bg-red-500/30' :
              impact.level === 'caution' ? 'bg-amber-500/30' :
              'bg-emerald-500/30'
            }`}>
              {impact.level !== 'good' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
              <strong>Work Impact:</strong> {impact.message}
            </div>
          );
        })()}
      </div>

      {/* 6-day forecast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {upcoming.map(day => {
          const impact = getWorkImpact(day);
          return (
            <div key={day.date} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{day.dayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{day.date}</p>
              <div className="my-3 flex justify-center">
                <WeatherIcon condition={day.condition} className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{day.high}°</p>
              <p className="text-sm text-gray-400">{day.low}°</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day.condition}</p>
              <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${
                impact.level === 'delay' ? 'bg-red-500' :
                impact.level === 'caution' ? 'bg-amber-500' :
                'bg-emerald-500'
              }`} title={impact.message} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Good for work</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Use caution</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Delays likely</span>
        {lastUpdated && <span className="ml-auto">Updated {lastUpdated}</span>}
      </div>
    </div>
  );
}
