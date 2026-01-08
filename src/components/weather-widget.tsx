
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CloudSun, Loader2, Search, MapPin, Wind, Droplets } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function WeatherWidget() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState({ name: 'Stellenbosch', lat: -33.9326, lon: 18.8602 });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user-weather-pref');
    if (saved) setLocation(JSON.parse(saved));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Pointing to internal API bridge to satisfy Firefox
    const url = `/api/weather?lat=${location.lat}&lon=${location.lon}`;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.properties) {
          setData(json.properties.timeseries);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const results = await res.json();
      if (results.length > 0) {
        const newLoc = { name: results[0].display_name.split(',')[0], lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
        setLocation(newLoc);
        localStorage.setItem('user-weather-pref', JSON.stringify(newLoc));
        setQuery('');
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  if (loading || !data) {
    return (
      <Card className="p-10 flex justify-center border-dashed border-slate-200">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </Card>
    );
  }

  const current = data[0].data.instant.details;
  const dailyForecast = data.filter((item: any) => item.time.includes('T12:00:00Z')).slice(0, 7);

  return (
    <Card className="w-full shadow-md border-none bg-slate-50/50">
      <CardHeader className="pb-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input 
            placeholder="Change location..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white"
          />
          <Button type="submit" size="icon" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
        
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-1 text-primary font-bold mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-lg">{location.name}</span>
            </div>
            <div className="text-5xl font-extrabold tracking-tighter">
              {Math.round(current.air_temperature)}°C
            </div>
          </div>
          <div className="text-right pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">yr.no live</span>
            <div className="flex flex-col gap-1 mt-2 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2 justify-end"><Wind className="h-4 w-4 text-slate-400" /> {current.wind_speed} m/s</div>
              <div className="flex items-center gap-2 justify-end"><Droplets className="h-4 w-4 text-slate-400" /> {current.relative_humidity}%</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-1 bg-white rounded-xl p-3 shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-1">7-Day Midday Forecast</p>
          {dailyForecast.map((day: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 px-1 border-b last:border-0 border-slate-50">
              <span className="w-20 font-semibold text-slate-700">
                {i === 0 ? 'Today' : new Date(day.time).toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
              <CloudSun className="h-5 w-5 text-orange-400" />
              <span className="w-12 text-right font-bold text-lg text-primary">
                {Math.round(day.data.instant.details.air_temperature)}°
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
