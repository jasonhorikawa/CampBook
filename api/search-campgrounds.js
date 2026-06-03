export default async function handler(req, res) {
  try {
    const { query } = req.query;
    const apiKey = process.env.RECGOV_API_KEY;

    const url =
      `https://ridb.recreation.gov/api/v1/facilities?query=${encodeURIComponent(
        query || ""
      )}&limit=10`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json",
        "apikey": apiKey.trim(),
      },
    });

    const text = await response.text();

    return res.status(200).json({
      envKeyExists: !!apiKey,
      keyLength: apiKey?.length,
      ridbStatus: response.status,
      ridbResponse: text,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
