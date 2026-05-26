import React, { useState } from "react";
const CrewView = ({ profiles, setProfiles }) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const EMOJIS = [
    "👤",
    "👨",
    "👩",
    "👦",
    "👧",
    "👨‍👩‍👧",
    "👨‍👩‍👦",
    "🧑",
    "👴",
    "👵",
    "🐕",
    "🐈",
  ];
  const add = () => {
    if (!name.trim()) return;
    setProfiles((p) => [
      ...p,
      {
        id: "p" + Date.now(),
        name,
        emoji,
        color: ["#3A6645", "#C8790A", "#2A5C7A", "#7A5530", "#A83030"][
          p.length % 5
        ],
      },
    ]);
    setName("");
    setEmoji("👤");
  };
  return (
    <div style={S.scroll}>
      <div style={S.card}>
        <div style={{ padding: "12px 14px" }}>
          <SLabel mt={0}>Your Crew</SLabel>
          <div
            style={{
              fontSize: 13,
              color: P.muted,
              marginBottom: 14,
              lineHeight: 1.7,
            }}
          >
            Add family and friends. Tag them on trips to filter your journal.
          </div>
          {profiles.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: P.cream,
                borderRadius: 10,
                marginBottom: 8,
                border: `1px solid ${P.border}`,
              }}
            >
              <span style={{ fontSize: 22 }}>{p.emoji}</span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: 15,
                  color: P.forest,
                }}
              >
                {p.name}
              </span>
              <button
                onClick={() =>
                  setProfiles((prev) => prev.filter((x) => x.id !== p.id))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: P.muted,
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <SLabel>Add Person</SLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 10,
            }}
          >
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: `2px solid ${emoji === e ? P.pine : P.border}`,
                  background: emoji === e ? P.pine + "22" : "transparent",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <Inp
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Dad, Kids, Jake)"
          />
          <Btn full color={P.pine} onClick={add}>
            Add to Crew
          </Btn>
        </div>
      </div>
    </div>
  );
};
export default CrewView;