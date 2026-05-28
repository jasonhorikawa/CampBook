import React, { useState } from "react";

function getText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.label ||
      value.site ||
      value.number ||
      JSON.stringify(value)
    );
  }
  return String(value);
}

function DetailSection({ title, children }) {
  if (
  !children ||
  children === "" ||
  (Array.isArray(children) && children.length === 0)
) {
  return null;
}

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        background: "rgba(255,255,255,0.55)",
        border: "1px solid rgba(120,95,60,0.22)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: 0.7,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function DetailList({ items, renderItem }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 6 }}>
          {renderItem ? renderItem(item, i) : `• ${getText(item)}`}
        </div>
      ))}
    </div>
  );
}

export default function FriendsView({
  friends = [],
  feedEntries = [],
  onApproveFriend,
  searchProfiles,
  sendFriendRequest,
  P,
  S,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const pending = friends.filter((f) => f.status === "pending");
  const active = friends
  .filter((f) => f.status === "friend")
  .filter(
    (f, i, arr) =>
      arr.findIndex(
        (x) =>
          [x.requester_id, x.receiver_id].sort().join("-") ===
          [f.requester_id, f.receiver_id].sort().join("-")
      ) === i
  );

  const openTrip = (trip) => {
    setSelectedTrip(trip);
    setPhotoIndex(0);
  };

  const closeTrip = () => {
    setSelectedTrip(null);
    setPhotoIndex(0);
  };

  const selectedPhotos = selectedTrip?.photos || [];

  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{ background: P.forest, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#ffffff88", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Your Privacy
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F4EFE6" }}>
            Who sees your trips?
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted, marginBottom: 8 }}>
            Pending
          </div>

          {pending.length === 0 ? (
            <div style={{ color: P.muted, fontSize: 13, marginBottom: 12 }}>No pending requests.</div>
          ) : (
            pending.map((f) => (
              <div key={f.id} style={{ ...S.card, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{f.name || "Camper"}</div>
                <div style={{ fontSize: 13, color: P.muted, marginTop: 3 }}>
                  Wants to see your camp trips
                </div>
                <button onClick={() => onApproveFriend(f.id)}>✓ Approve</button>
              </div>
            ))
          )}

          <input
            placeholder="Search by name..."
            value={search}
            onChange={async (e) => {
              const value = e.target.value;
              setSearch(value);
              if (value.trim().length < 3) {
                setResults([]);
                return;
              }
              const found = await searchProfiles(value);
              setResults(found || []);
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${P.border}`,
              fontSize: 14,
              boxSizing: "border-box",
              marginBottom: 12,
            }}
          />

          {results.map((profile) => (
            <div key={profile.id} style={{ ...S.card, padding: 12, marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>{profile.display_name || profile.email || "Camper"}</div>
              <button onClick={() => sendFriendRequest(profile.id)}>Add</button>
            </div>
          ))}

          {active.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted, margin: "12px 0 8px" }}>
                Approved Friends
              </div>
              {active.map((f) => (
                <div key={f.id} style={{ fontSize: 14, padding: "6px 0" }}>
                  👤 {f.name || "Camper"}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ background: P.forest, borderRadius: 18, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: "#ffffff88", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Friends Feed
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#F4EFE6" }}>
            Shared Trips
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {feedEntries.length === 0 ? (
            <div style={{ color: P.muted, fontSize: 13 }}>No shared trips yet.</div>
          ) : (
            feedEntries.map((trip) => (
              <div
                key={trip.supabase_id || trip.id}
                style={{ ...S.card, marginBottom: 18, overflow: "hidden", cursor: "pointer" }}
                onClick={() => openTrip(trip)}
              >
                {trip.photos?.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
                    <img src={trip.photos[0].url || trip.photos[0]} alt="" style={{ width: "100%", height: 190, objectFit: "cover" }} />
                    <div style={{ display: "grid", gap: 3 }}>
                      {trip.photos.slice(1, 3).map((photo, i) => (
                        <img key={i} src={photo.url || photo} alt="" style={{ width: "100%", height: 93, objectFit: "cover" }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: P.forest }}>
                    {trip.campgroundName || trip.campground || "Untitled Trip"}
                  </div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 3 }}>
                  Shared by {trip.userName || trip.name || "Camper"}
                </div>
                  <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>
                    📍 {trip.location || "No location"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTrip && (
        <div
          onClick={closeTrip}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            zIndex: 9999,
            overflowY: "auto",
            padding: 14,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
              margin: "24px auto 80px",
              background: P.bg,
              borderRadius: 22,
              overflow: "hidden",
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 3,
                background: P.forest,
                color: "#F4EFE6",
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>
                  Shared Trip
                </div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {selectedTrip.userName || "Camper"}
                </div>
              </div>

              <button
                onClick={closeTrip}
                style={{
                  padding: "8px 13px",
                  borderRadius: 999,
                  border: "none",
                  fontWeight: 800,
                }}
              >
                Close
              </button>
            </div>

            {selectedPhotos.length > 0 && (
              <div style={{ position: "relative", background: "#111" }}>
                <div
                  onScroll={(e) => {
                    const width = e.currentTarget.clientWidth || 1;
                    setPhotoIndex(Math.round(e.currentTarget.scrollLeft / width));
                  }}
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                  }}
                >
                  {selectedPhotos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo.url || photo}
                      alt=""
                      style={{
                        width: "100%",
                        maxHeight: 430,
                        objectFit: "cover",
                        flexShrink: 0,
                        scrollSnapAlign: "center",
                      }}
                    />
                  ))}
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    bottom: 12,
                    background: "rgba(0,0,0,0.62)",
                    color: "white",
                    borderRadius: 999,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {Math.min(photoIndex + 1, selectedPhotos.length)} / {selectedPhotos.length}
                </div>
              </div>
            )}

            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: P.forest, lineHeight: 1.1 }}>
                {selectedTrip.campgroundName || selectedTrip.campground || "Untitled Trip"}
              </div>

              <div style={{ marginTop: 8, color: P.muted, fontSize: 15 }}>
                📍 {selectedTrip.location || "No location"}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {selectedTrip.dates && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🗓 {selectedTrip.dates}
                  </span>
                )}
                {selectedTrip.nights && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🌙 {selectedTrip.nights} nights
                  </span>
                )}
                {selectedTrip.rating > 0 && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    ⭐ {selectedTrip.rating}/5
                  </span>
                )}
              </div>

              <DetailSection title="Notes">
                {getText(selectedTrip.notes)}
              </DetailSection>

              <DetailSection title="Campsite Info">
                {getText(
                  selectedTrip.campsite ||
                    selectedTrip.campsiteInfo ||
                    selectedTrip.siteInfo ||
                    selectedTrip.siteNotes
                )}
              </DetailSection>

              <DetailSection title="Site Number">
                {getText(selectedTrip.siteNumber || selectedTrip.site || selectedTrip.campSiteNumber)}
              </DetailSection>

              <DetailSection title="Fishing Info">
                {getText(selectedTrip.fishing || selectedTrip.fishingInfo || selectedTrip.fishingNotes)}
              </DetailSection>

              <DetailSection title="Fishing Log">
                <DetailList
                  items={selectedTrip.fishingLog || selectedTrip.fishLog || []}
                  renderItem={(fish) =>
                    `🎣 ${fish.species || fish.name || fish.fish || getText(fish)}${
                      fish.count ? ` x${fish.count}` : ""
                    }${fish.notes ? ` — ${fish.notes}` : ""}`
                  }
                />
              </DetailSection>

              <DetailSection title="Packing List">
                <DetailList
                  items={selectedTrip.packingList || selectedTrip.packing || selectedTrip.gear || []}
                  renderItem={(item) => `• ${item.name || item.item || item.label || getText(item)}`}
                />
              </DetailSection>

              <DetailSection title="Weather">
                {getText(selectedTrip.weather || selectedTrip.weatherNotes)}
              </DetailSection>

              <DetailSection title="Memory Spots">
                <DetailList
                  items={selectedTrip.memorySpots || selectedTrip.memories || []}
                  renderItem={(spot) => `📌 ${spot.title || spot.name || spot.note || getText(spot)}`}
                />
              </DetailSection>

              <DetailSection title="Favorites">
                <DetailList
                  items={selectedTrip.favorites || selectedTrip.favoriteThings || []}
                  renderItem={(item) => `⭐ ${item.name || item.title || item.label || getText(item)}`}
                />
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
