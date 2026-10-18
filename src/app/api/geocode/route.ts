import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Yandex Geocoder API Key
  const API_KEY = "5be791ac-0fdf-4f9a-966c-aac0eef56577";
  
  try {
    const yandexUrl = `https://geocode-maps.yandex.ru/1.x/?format=json&lang=uz_UZ&apikey=${API_KEY}&geocode=${encodeURIComponent(q)}&results=7`;
    
    const res = await fetch(yandexUrl);
    
    // Yandex ba'zan HTML/Text qaytaradi xato bo'lganda (masalan 403)
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       const text = await res.text();
       return NextResponse.json({ error: 'Yandex xatosi: ' + text }, { status: res.status });
    }

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Yandex API xatosi' }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: error.message || 'Ichki server xatosi' }, { status: 500 });
  }
}
