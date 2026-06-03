export default async function handler(req, res) {
  try {
    const { query } = req.query;
    const apiKey = process.env.RECGOV_API_KEY;

    if (!query) {
      return res.status(400).json({
        error: "Missing query",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing RECGOV_API_KEY",
      });
    }

    const url = `https://ridb.recreation.gov/api/v1/facilities?query=${encodeURIComponent(
      query
    )}&limit=10&full=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        apikey: apiKey.trim(),
        "User-Agent": "CampBook/1.0",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.error || "Recreation.gov request failed",
        status: response.status,
        data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
