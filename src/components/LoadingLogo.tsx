interface Props {
  height?: string;
  size?: number;
}

export default function LoadingLogo({ height = "50vh", size = 80 }: Props) {
  const fontSize = Math.round(size * 0.28);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height }}>
      <div style={{ textAlign: "center" }}>
        {/* Пульсирующий круг с логотипом */}
        <div
          className="loading-logo-ring"
          style={{
            width: size, height: size,
            border: "2px solid #8B0000",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
            position: "relative",
            backgroundColor: "#FFFFFF"
          }}
        >
          {/* Итальянская полоска сверху */}
          <div style={{
            position: "absolute", top: -2, left: -2, right: -2,
            height: 6, borderRadius: "50% 50% 0 0",
            background: "linear-gradient(to right, #008000 33%, #FFFFFF 33%, #FFFFFF 66%, #FF0000 66%)",
            overflow: "hidden"
          }} />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize, fontWeight: 600,
            color: "#8B0000", letterSpacing: 2,
            userSelect: "none"
          }}>
            DR
          </span>
        </div>
        <p
          className="loading-logo-text"
          style={{
            fontSize: 10, letterSpacing: 5,
            textTransform: "uppercase",
            color: "#8B0000", fontFamily: "Montserrat",
            fontWeight: 600, margin: 0
          }}
        >
          DORRO
        </p>
      </div>
    </div>
  );
}
