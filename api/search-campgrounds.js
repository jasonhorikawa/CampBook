const response = await fetch(url, {
  method: "GET",
  headers: {
    accept: "application/json",
    apikey: apiKey.trim(),
    "User-Agent": "CampBook/1.0",
  },
});
