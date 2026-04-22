import Image from "next/image";

interface LogoProps {
  size?: number;
  showName?: boolean;
}

export default function Logo({ size = 120, showName = true }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Layered glow rings */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "radial-gradient(circle, rgba(26,86,196,0.25) 0%, transparent 70%)",
            animationDuration: "2.5s",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(26,86,196,0.35) 0%, transparent 65%)",
            filter: "blur(18px)",
            transform: "scale(1.15)",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 60%)",
            filter: "blur(8px)",
          }}
        />
        <Image
          src="/Daleeli-logo.svg"
          alt="Daleeli"
          width={size}
          height={size}
          className="relative drop-shadow-lg"
          priority
        />
      </div>
      {showName && (
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.22,
            color: "#1a56c4",
            letterSpacing: "0.12em",
          }}
        >
          DALEELI
        </span>
      )}
    </div>
  );
}




