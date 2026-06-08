import React, { useState } from "react";

function previewSrc(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  if (typeof photo.thumbUrl === "string") return photo.thumbUrl;
  if (typeof photo.thumbnailUrl === "string") return photo.thumbnailUrl;
  if (typeof photo.previewUrl === "string") return photo.previewUrl;
  if (typeof photo.url === "string") return photo.url;
  if (photo.url && typeof photo.url === "object") {
    return photo.url.thumbUrl || photo.url.thumbnailUrl || photo.url.previewUrl || photo.url.url || "";
  }
  return "";
}

function fullSrc(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  if (typeof photo.url === "string") return photo.url;
  if (typeof photo.previewUrl === "string") return photo.previewUrl;
  if (photo.url && typeof photo.url === "object") {
    return photo.url.url || photo.url.previewUrl || "";
  }
  return "";
}

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

function getMapQuery(place = {}) {
  const parts = [
    place.spotName,
    place.spot,
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

function formatDate(s) {
  if (!s) return "";
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateRange(trip = {}) {
  if (trip.dates) return trip.dates;
  const start = trip.startDate || trip.start_date;
  const end = trip.endDate || trip.end_date;
  if (start && end) return `${formatDate(start)} → ${formatDate(end)}`;
  if (start) return formatDate(start);
  return "";
}

function getNights(trip = {}) {
  if (trip.nights) return trip.nights;
  const start = trip.startDate || trip.start_date;
  const end = trip.endDate || trip.end_date;
  if (!start || !end) return "";
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const n = Math.round((e - s) / 86400000);
  return n > 0 ? n : "";
}

function timeAgo(dateString) {
  if (!dateString) return "Shared trip";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Shared trip";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function getTripTheme(trip, P) {
  const hay = [
    trip.campgroundName,
    trip.campground,
    trip.location,
    trip.notes,
    ...(trip.activities || []),
    JSON.stringify(trip.fishingLog || trip.fishLog || []),
  ]
    .join(" ")
    .toLowerCase();

  if (hay.includes("fish") || hay.includes("trout") || hay.includes("lake") || hay.includes("creek")) {
    return { emoji: "🎣", c1: P.water, c2: P.pine, label: "Fishing Trip" };
  }
  if (hay.includes("ocean") || hay.includes("beach") || hay.includes("island") || hay.includes("catalina")) {
    return { emoji: "🌊", c1: P.water, c2: "#4D8AA8", label: "Coastal Camp" };
  }
  if (hay.includes("mammoth") || hay.includes("sierra") || hay.includes("mount") || hay.includes("sequoia")) {
    return { emoji: "🏔️", c1: P.forest, c2: P.water, label: "Mountain Trip" };
  }
  if (hay.includes("desert") || hay.includes("joshua") || hay.includes("moab") || hay.includes("yucca")) {
    return { emoji: "🏜️", c1: P.earth, c2: P.amber, label: "Desert Camp" };
  }
  return { emoji: "🏕️", c1: P.forest, c2: P.pine, label: "Camp Memory" };
}

function Badge({ children, P }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 8px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.88)",
        border: `1px solid ${P.border}`,
        color: P.forest,
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function MapButtons({ place, P }) {
  const query = getMapQuery(place);
  if (!query) return null;

  const btnStyle = {
    flex: 1,
    padding: "8px 10px",
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
      style={{ display: "flex", gap: 8, marginTop: 10 }}
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
        <div key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
          {renderItem ? renderItem(item, i) : `• ${getText(item)}`}
        </div>
      ))}
    </div>
  );
}

function FriendTripCard({ trip, P, onClick }) {
  const photos = trip.photos || trip.previewPhotos || [];
  const cover = trip.cover || previewSrc(photos[0]);
  const theme = getTripTheme(trip, P);
  const dateRange = formatDateRange(trip);
  const nights = getNights(trip);
  const photoCount = trip.photoCount || photos.length || 0;
  const fishingCount = (trip.fishingLog || trip.fishLog || []).length;
  const hasNotes = Boolean(String(trip.notes || "").trim());
  const hasMemories = (trip.memorySpots || trip.memories || []).length > 0;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 22,
        overflow: "hidden",
        marginBottom: 18,
        cursor: "pointer",
        background: P.card,
        border: `1px solid ${P.border}`,
        boxShadow: "0 8px 24px rgba(60,42,22,0.14)",
      }}
    >
      <div style={{ position: "relative", minHeight: 218, background: `linear-gradient(135deg,${theme.c1},${theme.c2})` }}>
        {cover ? (
          <img
            src={cover}
            loading="lazy"
            alt=""
            style={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F4EFE6",
              fontSize: 58,
            }}
          >
            {theme.emoji}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.74))",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,0,0,0.42)",
              color: "white",
              borderRadius: 999,
              padding: "7px 10px",
              backdropFilter: "blur(8px)",
              minWidth: 0,
            }}
          >
            <span>{trip.userAvatar || "🏕️"}</span>
            <span style={{ fontSize: 12, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {trip.userName || trip.name || "Camper"}
            </span>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              color: P.forest,
              borderRadius: 999,
              padding: "6px 9px",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {timeAgo(trip.created_at)}
          </div>
        </div>

        <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, color: "white" }}>
          <div style={{ fontSize: 24, fontWeight: 950, lineHeight: 1.05, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
            {trip.campgroundName || trip.campground || "Untitled Trip"}
          </div>
          <div style={{ marginTop: 5, fontSize: 13, opacity: 0.9 }}>
            📍 {trip.location || "No location added"}
          </div>
        </div>
      </div>

      <div style={{ padding: 13 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {photoCount > 0 && <Badge P={P}>📸 {photoCount} photo{photoCount === 1 ? "" : "s"}</Badge>}
          {dateRange && <Badge P={P}>🗓 {dateRange}</Badge>}
          {nights && <Badge P={P}>🌙 {nights} night{Number(nights) === 1 ? "" : "s"}</Badge>}
          {fishingCount > 0 && <Badge P={P}>🎣 {fishingCount} fishing spot{fishingCount === 1 ? "" : "s"}</Badge>}
          {hasNotes && <Badge P={P}>📝 Notes</Badge>}
          {hasMemories && <Badge P={P}>📌 Memories</Badge>}
          {!photoCount && !dateRange && !nights && !fishingCount && !hasNotes && !hasMemories && (
            <Badge P={P}>👆 Tap to view details</Badge>
          )}
        </div>

        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
            {photos.slice(0, 3).map((photo, i) => (
              <img
                key={i}
                src={previewSrc(photo)}
                loading="lazy"
                alt=""
                style={{
                  width: `${100 / Math.min(photos.length, 3)}%`,
                  height: 62,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: `1px solid ${P.border}`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendsView({
  friends = [],
  feedEntries = [],
  onApproveFriend,
  searchProfiles,
  sendFriendRequest,
  loadFullTrip,
  P,
  S,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadingTripId, setLoadingTripId] = useState(null);

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

  const openTrip = async (trip) => {
    setPhotoIndex(0);
    setSelectedTrip(trip);

    if (!loadFullTrip || !trip?.id) return;

    setLoadingTripId(trip.id);
    const fullTrip = await loadFullTrip(trip.id);
    setLoadingTripId(null);

    if (fullTrip) {
      setSelectedTrip({
        ...trip,
        ...fullTrip,
        userName: trip.userName,
        userAvatar: trip.userAvatar,
        userColor: trip.userColor,
        created_at: trip.created_at,
        privacy: trip.privacy,
      });
    }
  };

  const closeTrip = () => {
    setSelectedTrip(null);
    setPhotoIndex(0);
    setLoadingTripId(null);
  };

  const selectedPhotos = selectedTrip?.photos || selectedTrip?.previewPhotos || [];

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
            <div style={{ color: P.muted, fontSize: 13, marginBottom: 12 }}>
              No pending requests.
            </div>
          ) : (
            pending.map((f) => (
              <div key={f.id} style={{ ...S.card, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {f.name || "Camper"}
                </div>
                <div style={{ fontSize: 13, color: P.muted, marginTop: 3 }}>
                  Wants to see your camp trips
                </div>
                <button
                  onClick={() => onApproveFriend(f.id)}
                  style={{
                    marginTop: 10,
                    border: "none",
                    borderRadius: 999,
                    background: P.pine,
                    color: "#fff",
                    padding: "8px 12px",
                    fontWeight: 900,
                  }}
                >
                  ✓ Approve
                </button>
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
              <div style={{ fontWeight: 700 }}>
                {profile.display_name || profile.email || "Camper"}
              </div>
              <button
                onClick={() => sendFriendRequest(profile.id)}
                style={{
                  marginTop: 8,
                  border: "none",
                  borderRadius: 999,
                  background: P.forest,
                  color: "#fff",
                  padding: "7px 11px",
                  fontWeight: 900,
                }}
              >
                Add Friend
              </button>
            </div>
          ))}

          {active.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted, margin: "12px 0 8px" }}>
                Approved Friends
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {active.map((f) => (
                  <span
                    key={f.id}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      background: "#fff",
                      border: `1px solid ${P.border}`,
                      fontSize: 12,
                      fontWeight: 800,
                      color: P.forest,
                    }}
                  >
                    👤 {f.name || "Camper"}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ background: `linear-gradient(135deg,${P.forest},${P.pine})`, borderRadius: 18, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -16, top: -26, fontSize: 96, opacity: 0.08 }}>🏕️</div>
          <div style={{ fontSize: 11, color: "#ffffff88", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Friends Feed
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#F4EFE6" }}>
            Shared Camping Memories
          </div>
          <div style={{ color: "#ffffffaa", fontSize: 13, marginTop: 5, lineHeight: 1.4 }}>
            Trips your approved friends have shared with you.
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {feedEntries.length === 0 ? (
            <div style={{ color: P.muted, fontSize: 13 }}>
              No shared trips yet.
            </div>
          ) : (
            feedEntries.map((trip) => (
              <div key={trip.supabase_id || trip.id} style={{ position: "relative" }}>
                <FriendTripCard trip={trip} P={P} onClick={() => openTrip(trip)} />
                {loadingTripId === trip.id && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 22,
                      background: "rgba(0,0,0,0.28)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  >
                    Loading full trip...
                  </div>
                )}
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
                      src={fullSrc(photo)}
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

              <MapButtons place={selectedTrip} P={P} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {formatDateRange(selectedTrip) && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🗓 {formatDateRange(selectedTrip)}
                  </span>
                )}
                {getNights(selectedTrip) && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🌙 {getNights(selectedTrip)} nights
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
                  renderItem={(fish) => {
                    const spotName =
                      fish.spotName ||
                      fish.spot ||
                      fish.location ||
                      fish.place ||
                      "Fishing Spot";

                    return (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "#fff",
                          border: `1px solid ${P.border}`,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: P.forest, fontSize: 16 }}>
                          🎣 {spotName}
                        </div>

                        <div style={{ marginTop: 4, color: P.muted, fontSize: 13 }}>
                          {fish.species || fish.name || fish.fish || "Fish not listed"}
                          {fish.count ? ` x${fish.count}` : ""}
                          {fish.bait ? ` · ${fish.bait}` : ""}
                          {fish.size ? ` · ${fish.size}` : ""}
                        </div>

                        {fish.notes && (
                          <div style={{ marginTop: 6, fontSize: 13 }}>
                            {fish.notes}
                          </div>
                        )}

                        <MapButtons
                          P={P}
                          place={{
                            spotName,
                            location: fish.mapLocation || fish.location || selectedTrip.location,
                            campgroundName: selectedTrip.campgroundName || selectedTrip.campground,
                          }}
                        />
                      </div>
                    );
                  }}
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
                  renderItem={(spot) => (
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        background: "#fff",
                        border: `1px solid ${P.border}`,
                      }}
                    >import React, { useState } from "react";

function previewSrc(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  if (typeof photo.thumbUrl === "string") return photo.thumbUrl;
  if (typeof photo.thumbnailUrl === "string") return photo.thumbnailUrl;
  if (typeof photo.previewUrl === "string") return photo.previewUrl;
  if (typeof photo.url === "string") return photo.url;
  if (photo.url && typeof photo.url === "object") {
    return photo.url.thumbUrl || photo.url.thumbnailUrl || photo.url.previewUrl || photo.url.url || "";
  }
  return "";
}

function fullSrc(photo) {
  if (!photo) return "";
  if (typeof photo === "string") return photo;
  if (typeof photo.url === "string") return photo.url;
  if (typeof photo.previewUrl === "string") return photo.previewUrl;
  if (photo.url && typeof photo.url === "object") {
    return photo.url.url || photo.url.previewUrl || "";
  }
  return "";
}

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

function getMapQuery(place = {}) {
  const parts = [
    place.spotName,
    place.spot,
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

function formatDate(s) {
  if (!s) return "";
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(s);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateRange(trip = {}) {
  if (trip.dates) return trip.dates;
  const start = trip.startDate || trip.start_date;
  const end = trip.endDate || trip.end_date;
  if (start && end) return `${formatDate(start)} → ${formatDate(end)}`;
  if (start) return formatDate(start);
  return "";
}

function getNights(trip = {}) {
  if (trip.nights) return trip.nights;
  const start = trip.startDate || trip.start_date;
  const end = trip.endDate || trip.end_date;
  if (!start || !end) return "";
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const n = Math.round((e - s) / 86400000);
  return n > 0 ? n : "";
}

function timeAgo(dateString) {
  if (!dateString) return "Shared trip";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Shared trip";
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function getTripTheme(trip, P) {
  const hay = [
    trip.campgroundName,
    trip.campground,
    trip.location,
    trip.notes,
    ...(trip.activities || []),
    JSON.stringify(trip.fishingLog || trip.fishLog || []),
  ]
    .join(" ")
    .toLowerCase();

  if (hay.includes("fish") || hay.includes("trout") || hay.includes("lake") || hay.includes("creek")) {
    return { emoji: "🎣", c1: P.water, c2: P.pine, label: "Fishing Trip" };
  }
  if (hay.includes("ocean") || hay.includes("beach") || hay.includes("island") || hay.includes("catalina")) {
    return { emoji: "🌊", c1: P.water, c2: "#4D8AA8", label: "Coastal Camp" };
  }
  if (hay.includes("mammoth") || hay.includes("sierra") || hay.includes("mount") || hay.includes("sequoia")) {
    return { emoji: "🏔️", c1: P.forest, c2: P.water, label: "Mountain Trip" };
  }
  if (hay.includes("desert") || hay.includes("joshua") || hay.includes("moab") || hay.includes("yucca")) {
    return { emoji: "🏜️", c1: P.earth, c2: P.amber, label: "Desert Camp" };
  }
  return { emoji: "🏕️", c1: P.forest, c2: P.pine, label: "Camp Memory" };
}

function Badge({ children, P }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 8px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.88)",
        border: `1px solid ${P.border}`,
        color: P.forest,
        fontSize: 11,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function MapButtons({ place, P }) {
  const query = getMapQuery(place);
  if (!query) return null;

  const btnStyle = {
    flex: 1,
    padding: "8px 10px",
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
      style={{ display: "flex", gap: 8, marginTop: 10 }}
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
        <div key={i} style={{ marginTop: i === 0 ? 0 : 10 }}>
          {renderItem ? renderItem(item, i) : `• ${getText(item)}`}
        </div>
      ))}
    </div>
  );
}

function FriendTripCard({ trip, P, onClick }) {
  const photos = trip.photos || trip.previewPhotos || [];
  const cover = trip.cover || previewSrc(photos[0]);
  const theme = getTripTheme(trip, P);
  const dateRange = formatDateRange(trip);
  const nights = getNights(trip);
  const photoCount = trip.photoCount || photos.length || 0;
  const fishingCount = (trip.fishingLog || trip.fishLog || []).length;
  const hasNotes = Boolean(String(trip.notes || "").trim());
  const hasMemories = (trip.memorySpots || trip.memories || []).length > 0;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 22,
        overflow: "hidden",
        marginBottom: 18,
        cursor: "pointer",
        background: P.card,
        border: `1px solid ${P.border}`,
        boxShadow: "0 8px 24px rgba(60,42,22,0.14)",
      }}
    >
      <div style={{ position: "relative", minHeight: 218, background: `linear-gradient(135deg,${theme.c1},${theme.c2})` }}>
        {cover ? (
          <img
            src={cover}
            loading="lazy"
            alt=""
            style={{ width: "100%", height: 230, objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              height: 230,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F4EFE6",
              fontSize: 58,
            }}
          >
            {theme.emoji}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.74))",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,0,0,0.42)",
              color: "white",
              borderRadius: 999,
              padding: "7px 10px",
              backdropFilter: "blur(8px)",
              minWidth: 0,
            }}
          >
            <span>{trip.userAvatar || "🏕️"}</span>
            <span style={{ fontSize: 12, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {trip.userName || trip.name || "Camper"}
            </span>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              color: P.forest,
              borderRadius: 999,
              padding: "6px 9px",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {timeAgo(trip.created_at)}
          </div>
        </div>

        <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, color: "white" }}>
          <div style={{ fontSize: 24, fontWeight: 950, lineHeight: 1.05, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
            {trip.campgroundName || trip.campground || "Untitled Trip"}
          </div>
          <div style={{ marginTop: 5, fontSize: 13, opacity: 0.9 }}>
            📍 {trip.location || "No location added"}
          </div>
        </div>
      </div>

      <div style={{ padding: 13 }}>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {photoCount > 0 && <Badge P={P}>📸 {photoCount} photo{photoCount === 1 ? "" : "s"}</Badge>}
          {dateRange && <Badge P={P}>🗓 {dateRange}</Badge>}
          {nights && <Badge P={P}>🌙 {nights} night{Number(nights) === 1 ? "" : "s"}</Badge>}
          {fishingCount > 0 && <Badge P={P}>🎣 {fishingCount} fishing spot{fishingCount === 1 ? "" : "s"}</Badge>}
          {hasNotes && <Badge P={P}>📝 Notes</Badge>}
          {hasMemories && <Badge P={P}>📌 Memories</Badge>}
          {!photoCount && !dateRange && !nights && !fishingCount && !hasNotes && !hasMemories && (
            <Badge P={P}>👆 Tap to view details</Badge>
          )}
        </div>

        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
            {photos.slice(0, 3).map((photo, i) => (
              <img
                key={i}
                src={previewSrc(photo)}
                loading="lazy"
                alt=""
                style={{
                  width: `${100 / Math.min(photos.length, 3)}%`,
                  height: 62,
                  objectFit: "cover",
                  borderRadius: 12,
                  border: `1px solid ${P.border}`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendsView({
  friends = [],
  feedEntries = [],
  onApproveFriend,
  searchProfiles,
  sendFriendRequest,
  loadFullTrip,
  P,
  S,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadingTripId, setLoadingTripId] = useState(null);

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

  const openTrip = async (trip) => {
    setPhotoIndex(0);
    setSelectedTrip(trip);

    if (!loadFullTrip || !trip?.id) return;

    setLoadingTripId(trip.id);
    const fullTrip = await loadFullTrip(trip.id);
    setLoadingTripId(null);

    if (fullTrip) {
      setSelectedTrip({
        ...trip,
        ...fullTrip,
        userName: trip.userName,
        userAvatar: trip.userAvatar,
        userColor: trip.userColor,
        created_at: trip.created_at,
        privacy: trip.privacy,
      });
    }
  };

  const closeTrip = () => {
    setSelectedTrip(null);
    setPhotoIndex(0);
    setLoadingTripId(null);
  };

  const selectedPhotos = selectedTrip?.photos || selectedTrip?.previewPhotos || [];

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
            <div style={{ color: P.muted, fontSize: 13, marginBottom: 12 }}>
              No pending requests.
            </div>
          ) : (
            pending.map((f) => (
              <div key={f.id} style={{ ...S.card, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {f.name || "Camper"}
                </div>
                <div style={{ fontSize: 13, color: P.muted, marginTop: 3 }}>
                  Wants to see your camp trips
                </div>
                <button
                  onClick={() => onApproveFriend(f.id)}
                  style={{
                    marginTop: 10,
                    border: "none",
                    borderRadius: 999,
                    background: P.pine,
                    color: "#fff",
                    padding: "8px 12px",
                    fontWeight: 900,
                  }}
                >
                  ✓ Approve
                </button>
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
              <div style={{ fontWeight: 700 }}>
                {profile.display_name || profile.email || "Camper"}
              </div>
              <button
                onClick={() => sendFriendRequest(profile.id)}
                style={{
                  marginTop: 8,
                  border: "none",
                  borderRadius: 999,
                  background: P.forest,
                  color: "#fff",
                  padding: "7px 11px",
                  fontWeight: 900,
                }}
              >
                Add Friend
              </button>
            </div>
          ))}

          {active.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: P.muted, margin: "12px 0 8px" }}>
                Approved Friends
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {active.map((f) => (
                  <span
                    key={f.id}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 999,
                      background: "#fff",
                      border: `1px solid ${P.border}`,
                      fontSize: 12,
                      fontWeight: 800,
                      color: P.forest,
                    }}
                  >
                    👤 {f.name || "Camper"}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ background: `linear-gradient(135deg,${P.forest},${P.pine})`, borderRadius: 18, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -16, top: -26, fontSize: 96, opacity: 0.08 }}>🏕️</div>
          <div style={{ fontSize: 11, color: "#ffffff88", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Friends Feed
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#F4EFE6" }}>
            Shared Camping Memories
          </div>
          <div style={{ color: "#ffffffaa", fontSize: 13, marginTop: 5, lineHeight: 1.4 }}>
            Trips your approved friends have shared with you.
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {feedEntries.length === 0 ? (
            <div style={{ color: P.muted, fontSize: 13 }}>
              No shared trips yet.
            </div>
          ) : (
            feedEntries.map((trip) => (
              <div key={trip.supabase_id || trip.id} style={{ position: "relative" }}>
                <FriendTripCard trip={trip} P={P} onClick={() => openTrip(trip)} />
                {loadingTripId === trip.id && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 22,
                      background: "rgba(0,0,0,0.28)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  >
                    Loading full trip...
                  </div>
                )}
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
                      src={fullSrc(photo)}
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

              <MapButtons place={selectedTrip} P={P} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {formatDateRange(selectedTrip) && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🗓 {formatDateRange(selectedTrip)}
                  </span>
                )}
                {getNights(selectedTrip) && (
                  <span style={{ padding: "6px 10px", borderRadius: 999, background: "#fff", border: `1px solid ${P.border}` }}>
                    🌙 {getNights(selectedTrip)} nights
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
                  renderItem={(fish) => {
                    const spotName =
                      fish.spotName ||
                      fish.spot ||
                      fish.location ||
                      fish.place ||
                      "Fishing Spot";

                    return (
                      <div
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "#fff",
                          border: `1px solid ${P.border}`,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: P.forest, fontSize: 16 }}>
                          🎣 {spotName}
                        </div>

                        <div style={{ marginTop: 4, color: P.muted, fontSize: 13 }}>
                          {fish.species || fish.name || fish.fish || "Fish not listed"}
                          {fish.count ? ` x${fish.count}` : ""}
                          {fish.bait ? ` · ${fish.bait}` : ""}
                          {fish.size ? ` · ${fish.size}` : ""}
                        </div>

                        {fish.notes && (
                          <div style={{ marginTop: 6, fontSize: 13 }}>
                            {fish.notes}
                          </div>
                        )}

                        <MapButtons
                          P={P}
                          place={{
                            spotName,
                            location: fish.mapLocation || fish.location || selectedTrip.location,
                            campgroundName: selectedTrip.campgroundName || selectedTrip.campground,
                          }}
                        />
                      </div>
                    );
                  }}
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
                  renderItem={(spot) => (
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        background: "#fff",
                        border: `1px solid ${P.border}`,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>
                        📌 {spot.title || spot.name || spot.note || getText(spot)}
                      </div>
                      <MapButtons
                        P={P}
                        place={{
                          title: spot.title || spot.name,
                          location: spot.location || selectedTrip.location,
                          campgroundName: selectedTrip.campgroundName || selectedTrip.campground,
                        }}
                      />
                    </div>
                  )}
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

                      <div style={{ fontWeight: 800 }}>
                        📌 {spot.title || spot.name || spot.note || getText(spot)}
                      </div>
                      <MapButtons
                        P={P}
                        place={{
                          title: spot.title || spot.name,
                          location: spot.location || selectedTrip.location,
                          campgroundName: selectedTrip.campgroundName || selectedTrip.campground,
                        }}
                      />
                    </div>
                  )}
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
