import React, { useState } from "react";

export default function FriendsView({
  feedEntries,
  setSelectedTrip,
  P,
  S,
}) {
  return (
    <div style={{ padding: 14 }}>
      {feedEntries.length === 0 ? (
        <div style={{ color: P.muted, fontSize: 13 }}>
          No shared trips yet.
        </div>
      ) : (
        feedEntries.map((trip) => (
          <div
            key={trip.supabase_id}
            style={{
              ...S.card,
              marginBottom: 18,
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => setSelectedTrip(trip)}
          >
            {trip.photos?.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: 3,
                }}
              >
                <img
                  src={trip.photos[0].url || trip.photos[0]}
                  alt=""
                  style={{
                    width: "100%",
                    height: 190,
                    objectFit: "cover",
                  }}
                />

                <div style={{ display: "grid", gap: 3 }}>
                  {trip.photos.slice(1, 3).map((photo, i) => (
                    <img
                      key={i}
                      src={photo.url || photo}
                      alt=""
                      style={{
                        width: "100%",
                        height: 93,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: "12px 14px" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: P.forest,
                }}
              >
                {trip.campgroundName ||
                  trip.campground ||
                  "Untitled Trip"}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: P.muted,
                  marginTop: 4,
                }}
              >
                📍 {trip.location || "No location"}
              </div>

              {trip.dates && (
                <div
                  style={{
                    fontSize: 13,
                    color: P.muted,
                    marginTop: 4,
                  }}
                >
                  🗓 {trip.dates}
                </div>
              )}

              {trip.nights && (
                <div
                  style={{
                    fontSize: 13,
                    color: P.muted,
                    marginTop: 4,
                  }}
                >
                  🌙 {trip.nights} nights
                </div>
              )}

              {trip.notes && (
                <div
                  style={{
                    fontSize: 14,
                    marginTop: 10,
                    lineHeight: 1.4,
                  }}
                >
                  {trip.notes}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
