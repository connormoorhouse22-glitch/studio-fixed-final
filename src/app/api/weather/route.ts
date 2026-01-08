
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '-33.9326';
  const lon = searchParams.get('lon') || '18.8602';
  
  // The User-Agent is required by the MET Norway API.
  const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, { 
    headers: { 
      'User-Agent': 'WineSpaceApp/1.0 (contact@winespace.co.za)' 
    } 
  });

  if (!res.ok) {
    // Forward the error from the external API
    return NextResponse.json({ error: `Failed to fetch weather data: ${res.statusText}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
