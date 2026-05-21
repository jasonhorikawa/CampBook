export default async function handler(req, res) {
  const { query } = req.query;
  const apiKey = process.env.VITE_RECGOV_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  const url = `https://ridb.recreation.gov/api/v1/facilities?limit=10&query=${encodeURIComponent(query)}&full=true&api_key=${apiKey.trim()}`;

  const response = await fetch(url, {
    headers: {
  apikey: apiKey.trim(),
  "X-Api-Key": apiKey.trim(),
  accept: "application/json",
},
  });

  const text = await response.text();

  return res.status(200).json({
    apiKeyLoaded: true,
    ridbStatus: response.status,
    url,
    rawStart: text.slice(0, 500),
  });
}
