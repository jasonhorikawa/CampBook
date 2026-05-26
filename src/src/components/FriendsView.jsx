import React, { useState } from "react";

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

  const pending = friends.filter((f) => f.status === "pending");
  const active = friends.filter((f) => f.status === "friend");

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
                onClick={() => setSelectedTrip(trip)}
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
          onClick={() => setSelectedTrip(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            overflowY: "auto",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 700,
              margin: "30px auto",
              background: P.bg,
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setSelectedTrip(null)}
              style={{
                margin: 12,
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                fontWeight: 700,
              }}
            >
              Close
            </button>

            <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
              {(selectedTrip.photos || []).map((photo, i) => (
                <img
                  key={i}
                  src={photo.url || photo}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 420,
                    objectFit: "cover",
                    flexShrink: 0,
                    scrollSnapAlign: "center",
                  }}
                />
              ))}
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: P.forest }}>
                {selectedTrip.campgroundName || selectedTrip.campground || "Untitled Trip"}
              </div>

              <div style={{ marginTop: 8, color: P.muted }}>
                📍 {selectedTrip.location || "No location"}
              </div>

              {selectedTrip.dates && <div style={{ marginTop: 8 }}>🗓 {selectedTrip.dates}</div>}
              {selectedTrip.nights && <div style={{ marginTop: 8 }}>🌙 {selectedTrip.nights} nights</div>}
              {selectedTrip.notes && <div style={{ marginTop: 16, lineHeight: 1.5 }}>{selectedTrip.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}