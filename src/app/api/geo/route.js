export const runtime = 'edge';

export async function GET(request) {
  try {
    const headers = request.headers;
    const country = (
      headers.get('x-vercel-ip-country') ||
      headers.get('cf-ipcountry') ||
      headers.get('x-country-code') ||
      headers.get('x-geo-country') ||
      'IN'
    ).toUpperCase();

    const isDomestic = country === 'IN';
    const currency = isDomestic ? 'INR' : 'USD';
    const symbol = isDomestic ? '₹' : '$';

    return Response.json(
      {
        country,
        isDomestic,
        currency,
        symbol,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err) {
    return Response.json({
      country: 'IN',
      isDomestic: true,
      currency: 'INR',
      symbol: '₹',
    });
  }
}
