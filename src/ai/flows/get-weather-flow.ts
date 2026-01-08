
'use server';
/**
 * @fileOverview This file defines a function for getting weather data.
 *
 * - getWeather - A function that takes a city and returns weather data.
 * - WeatherInput - The input type for the getWeather function.
 * - WeatherData - The return type for the getWeather function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Zod schema for the weather API response
const WeatherApiSchema = z.object({
  name: z.string(),
  main: z.object({
    temp: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({
    speed: z.number(),
  }),
  weather: z.array(z.object({
    id: z.number(),
    main: z.string(),
    description: z.string(),
    icon: z.string(),
  })),
});

// Zod schema for the forecast API response
const ForecastApiSchema = z.object({
    list: z.array(z.object({
        dt: z.number(),
        main: z.object({
            temp: z.number(),
            temp_min: z.number(),
            temp_max: z.number(),
        }),
        weather: z.array(z.object({
            icon: z.string(),
        })),
        dt_txt: z.string(),
    })),
});


export const WeatherInputSchema = z.object({
  city: z.string().describe("The city for which to get the weather, e.g. 'Stellenbosch'"),
});
export type WeatherInput = z.infer<typeof WeatherInputSchema>;


export const DailyForecastSchema = z.object({
    date: z.string(),
    minTemp: z.number(),
    maxTemp: z.number(),
    symbol_code: z.string(),
    hourly: z.array(z.object({
        time: z.string(),
        temp: z.number(),
        symbol_code: z.string(),
    }))
});

export const WeatherDataSchema = z.object({
  weather: z.object({
      temp: z.number(),
      humidity: z.number(),
      wind_speed: z.number(),
      symbol_code: z.string(),
      name: z.string(),
  }).optional(),
  forecast: z.array(DailyForecastSchema).optional(),
  error: z.string().optional(),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;
export type DailyForecast = z.infer<typeof DailyForecastSchema>;


const getWeatherTool = ai.defineTool(
    {
        name: 'getWeather',
        description: 'Get the current weather and a 5-day forecast for a given city.',
        inputSchema: WeatherInputSchema,
        outputSchema: WeatherDataSchema,
    },
    async (input) => {
        // NOTE: In a real app, you would use a valid API key. This is hardcoded for the prototype.
        const apiKey = 'YOUR_OPENWEATHER_API_KEY';
        
        try {
            const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input.city}&appid=${apiKey}&units=metric`);
            if (!weatherResponse.ok) {
                 const errorData = await weatherResponse.json();
                 return { error: `Could not retrieve weather data for ${input.city}. Reason: ${errorData.message}` };
            }
            const weatherJson = await weatherResponse.json();
            const weatherData = WeatherApiSchema.parse(weatherJson);

            const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${input.city}&appid=${apiKey}&units=metric`);
            if (!forecastResponse.ok) {
                return { error: 'Could not retrieve forecast data.' };
            }
            const forecastJson = await forecastResponse.json();
            const forecastData = ForecastApiSchema.parse(forecastJson);

            // Group forecast by day
            const dailyForecasts: { [key: string]: { temps: number[], icons: string[], hourly: any[] } } = {};

            forecastData.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = { temps: [], icons: [], hourly: [] };
                }
                dailyForecasts[date].temps.push(item.main.temp);
                 dailyForecasts[date].icons.push(item.weather[0].icon);
                 dailyForecasts[date].hourly.push({
                    time: item.dt_txt,
                    temp: item.main.temp,
                    symbol_code: item.weather[0].icon,
                });
            });
            
             const processedForecast: DailyForecast[] = Object.keys(dailyForecasts).slice(0, 7).map(date => {
                const dayData = dailyForecasts[date];
                const minTemp = Math.min(...dayData.temps);
                const maxTemp = Math.max(...dayData.temps);
                const mostCommonIcon = dayData.icons.sort((a,b) =>
                      dayData.icons.filter(v => v===a).length
                    - dayData.icons.filter(v => v===b).length
                ).pop()!;
                
                return {
                    date,
                    minTemp,
                    maxTemp,
                    symbol_code: mostCommonIcon,
                    hourly: dayData.hourly,
                };
            });


            return {
                weather: {
                    temp: weatherData.main.temp,
                    humidity: weatherData.main.humidity,
                    wind_speed: weatherData.wind.speed,
                    symbol_code: weatherData.weather[0].icon,
                    name: weatherData.name,
                },
                forecast: processedForecast
            };

        } catch (e) {
            console.error(e);
            return { error: 'Failed to process weather data.' };
        }
    }
);

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherDataSchema,
  },
  async (input) => {
    const result = await getWeatherTool(input);
    return result;
  }
);


export async function getWeather(input: WeatherInput): Promise<WeatherData> {
    return getWeatherFlow(input);
}
