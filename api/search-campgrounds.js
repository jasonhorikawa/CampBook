export default async function handler(req, res) {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(200).json({ results: [] });
  }

  const apiKey = process.env.VITE_RECGOV_API_KEY;

  const response = await fetch(
    `https://ridb.recreation.gov/api/v1/facilities?limit=10&query=${encodeURIComponent(query)}&full=true`,
    {
      headers: {
        apikey: apiKey,
      },
    }
  );

  const data = await response.json();

  res.status(200).json({
    results: data.RECDATA || [],
  });
}
