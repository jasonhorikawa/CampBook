import React from "react";
function ProfileView({ entries, profiles, friends, darkMode, setDarkMode, calcTripStats }) {
  const st = calcTripStats(entries);
  return (
    <div style={S.scroll}>
      <div
        style={{
          background: `linear-gradient(135deg,${P.earth},${P.forest})`,
          borderRadius: 18,
          padding: 18,
          color: "#F4EFE6",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar emoji="👤" color="#F4EFE6" size={54} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              CampBook Profile
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {entries.length} trips ·{" "}
              {friends.filter((f) => f.status === "friend").length} friends ·{" "}
              {profiles.length} crew
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          { l: "Fish caught", v: st.fish },
          { l: "Nights camped", v: st.nights },
          { l: "Miles driven", v: st.miles || 0 },
          { l: "Gas spent", v: st.gas ? `$${st.gas}` : "—" },
        ].map((x) => (
          <div
            key={x.l}
            style={{
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: P.forest }}>
              {x.v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: P.muted,
                textTransform: "uppercase",
              }}
            >
              {x.l}
            </div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Best Of</SLabel>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, color: P.text }}>
              🏕️ Most visited:{" "}
              <strong>
                {st.mostVisited
                  ? `${st.mostVisited[0]} (${st.mostVisited[1]})`
                  : "—"}
              </strong>
            </div>
            <div style={{ fontSize: 13, color: P.text }}>
              🏆 Biggest fish:{" "}
              <strong>
                {st.trophy
                  ? `${st.trophy.species}${
                      st.trophy.size ? ` · ${st.trophy.size}` : ""
                    }`
                  : "—"}
              </strong>
            </div>
            <div style={{ fontSize: 13, color: P.text }}>
              📍 Remembered spots: <strong>{st.remembered}</strong>
            </div>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Appearance</SLabel>
          <Check
            label="Dark mode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            icon="🌙"
          />
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Family Trip Timeline</SLabel>
          {entries.length === 0 && (
            <div style={{ fontSize: 13, color: P.muted }}>
              Trips you tag with your crew will appear here.
            </div>
          )}
          {entries
            .slice()
            .reverse()
            .map((e) => (
              <div
                key={e.id}
                style={{
                  borderLeft: `3px solid ${P.pine}`,
                  padding: "0 0 13px 12px",
                  marginLeft: 6,
                }}
              >
                <div style={{ fontWeight: 700, color: P.forest, fontSize: 14 }}>
                  {e.campgroundName}
                </div>
                <div style={{ fontSize: 12, color: P.muted }}>
                  {e.startDate ? niceDate(e.startDate) : "No date"}
                  {e.who?.length ? ` · ${e.who.length} crew tagged` : ""}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Social Profile Preview</SLabel>
          <div style={{ fontSize: 13, color: P.muted, lineHeight: 1.7 }}>
            This is where public/friend-only trip cards, badges, favorite camps,
            and trophy catches can live when you add a backend.
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProfileView;
