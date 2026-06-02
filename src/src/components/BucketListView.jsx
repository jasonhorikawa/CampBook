import React, { useState } from "react";

function getMapQuery(place = {}) {
  const parts = [
    place.name,
    place.title,
    place.address,
    place.location,
    place.campgroundName,
    place.campground,
  ].filter(Boolean);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function openAppleMaps(place) {
  const query = getMapQuery(place);
  if (!query) return alert("Add a place name or location first.");
  window.open(`https://maps.apple.com/?q=${encodeURIComponent(query)}`, "_blank");
}

function openGoogleMaps(place) {
  const query = getMapQuery(place);
  if (!query) return alert("Add a place name or location first.");
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    "_blank"
  );
}

function MapButtons({ place, P }) {
  const query = getMapQuery(place);
  if (!query) return null;

  const btnStyle = {
    flex: 1,
    padding: "7px 9px",
    borderRadius: 10,
    border: `1.5px solid ${P.border}`,
    background: "#fff",
    color: P.forest,
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: "flex", gap: 8, marginTop: 8 }}
    >
      <button style={btnStyle} onClick={() => openAppleMaps(place)}>
        📍 Apple Maps
      </button>
      <button style={btnStyle} onClick={() => openGoogleMaps(place)}>
        Google Maps
      </button>
    </div>
  );
}

function BucketListView({
  bucketList,
  setBucketList,
  favorites,
  onSelectCamp,
  searchDB = () => [],
  S,
  P,
  Btn,
  SLabel,
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  const addCamp = (c) =>
    setBucketList((p) =>
      p.some((x) => x.id === c.id)
        ? p
        : [
            ...p,
            {
              id: c.id,
              name: c.name,
              location: c.location,
              emoji: c.emoji,
              notes: "",
              priority: "Want to go",
            },
          ]
    );

  const runSearch = () => {
    setResults(searchDB(q));
  };

  return (
    <div style={S.scroll}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          placeholder="Search and add campgrounds..."
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "#fff",
            border: `1.5px solid ${P.border}`,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "'Lora',Georgia,serif",
            outline: "none",
          }}
        />

        <Btn onClick={runSearch}>🔍</Btn>
      </div>

      {results.map((c) => (
        <div key={c.id} style={S.card}>
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>{c.emoji}</span>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{c.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{c.location}</div>
              <MapButtons place={c} P={P} />
            </div>

            <Btn small color={P.amber} onClick={() => addCamp(c)}>
              Add
            </Btn>
          </div>
        </div>
      ))}

      <SLabel>⭐ Favorite Campsites</SLabel>

      {favorites.length === 0 && (
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 12 }}>
          Favorite campsites from Discover to see them here.
        </div>
      )}

      {favorites.map((f) => (
        <div key={f.id} style={S.card}>
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 25 }}>{f.emoji || "🏕️"}</span>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{f.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{f.location}</div>
              <MapButtons place={f} P={P} />
            </div>
          </div>
        </div>
      ))}

      <SLabel>🪣 Bucket List</SLabel>

      {bucketList.length === 0 && (
        <div style={{ textAlign: "center", padding: "25px", color: P.muted }}>
          No bucket-list camps yet.
        </div>
      )}

      {bucketList.map((c) => (
        <div key={c.id} style={S.card}>
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>{c.emoji || "🏕️"}</span>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: P.forest }}>{c.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{c.location}</div>
              <MapButtons place={c} P={P} />
            </div>

            <button
              onClick={() =>
                setBucketList((p) => p.filter((x) => x.id !== c.id))
              }
              style={{
                background: "none",
                border: "none",
                color: P.red,
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BucketListView;
