export default async function handler(req, res) {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(200).json({ results: [] });
  }

  try {
    const apiKey = process.env.VITE_RECGOV_API_KEY;

    const response = await fetch(
      `https://ridb.recreation.gov/api/v1/facilities?query=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          apikey: apiKey,
          accept: "application/json",
        },
      }
    );

    const text = await response.text();

    console.log(text);

    const data = JSON.parse(text);

    return res.status(200).json({
      results: data.RECDATA || [],
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      results: [],
      error: err.message,
    });
  }
}
