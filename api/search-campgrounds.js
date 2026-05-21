export default async function handler(req, res) {
  const { query } = req.query;
  const apiKey = process.env.VITE_RECGOV_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing API key" });
  }

  const url =
    `https://ridb.recreation.gov/api/v1/facilities?limit=10&query=${encodeURIComponent(query)}&full=true&apikey=${apiKey.trim()}`;

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  const data = await response.json();

  return res.status(200).json(data);
}
