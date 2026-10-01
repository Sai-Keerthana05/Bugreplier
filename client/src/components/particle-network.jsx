import { useEffect, useRef } from "react";

export function ParticleNetwork() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, active: false };
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
    let particles = [];

    const COLORS = ["#60a5fa", "#93c5fd", "#ffffff", "#3b82f6"];
    const ACCENT = "#ef4444";

    const density = () => {
      const area = width * height;
      const base = Math.round(area / 11000);
      const max = window.innerWidth < 640 ? 70 : window.innerWidth < 1024 ? 130 : 200;
      return Math.min(base, max);
    };

    const build = () => {
      const count = density();
      particles = new Array(count).fill(0).map(() => {
        const isAccent = Math.random() < 0.04;
        const depth = 0.4 + Math.random() * 0.6;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          bx: 0, by: 0,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: (0.7 + Math.random() * 1.6) * depth,
          color: isAccent ? ACCENT : COLORS[Math.floor(Math.random() * COLORS.length)],
          depth,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      parallax.tx = (mouse.x / width - 0.5) * 14;
      parallax.ty = (mouse.y / height - 0.5) * 14;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; parallax.tx = 0; parallax.ty = 0; };
    const onTouch = (e) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    };

    const LINK_DIST = () => (window.innerWidth < 640 ? 90 : 130);

    const tick = () => {
      parallax.x += (parallax.tx - parallax.x) * 0.04;
      parallax.y += (parallax.ty - parallax.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const linkDist = LINK_DIST();
      const linkSq = linkDist * linkDist;
      const mr = 140;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < mr * mr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (mr - d) / mr;
            // attract softly, repel when very close
            const sign = d < 45 ? -1 : 0.35;
            p.vx += (dx / d) * f * sign * 0.06;
            p.vy += (dy / d) * f * sign * 0.06;
          }
        }

        // damping + soft speed cap
        p.vx *= 0.985; p.vy *= 0.985;
        const sp = Math.hypot(p.vx, p.vy);
        const maxSp = 1.2;
        if (sp > maxSp) { p.vx = (p.vx / sp) * maxSp; p.vy = (p.vy / sp) * maxSp; }

        // wrap
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // lines
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkSq) {
            const alpha = 1 - d2 / linkSq;
            ctx.strokeStyle = `rgba(96,165,250,${alpha * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(a.x + parallax.x * a.depth, a.y + parallax.y * a.depth);
            ctx.lineTo(b.x + parallax.x * b.depth, b.y + parallax.y * b.depth);
            ctx.stroke();
          }
        }
      }

      // particles (glow)
      for (const p of particles) {
        const px = p.x + parallax.x * p.depth;
        const py = p.y + parallax.y * p.depth;
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        g.addColorStop(0, p.color);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(2,6,23,0) 40%, rgba(2,6,23,0.55) 100%)",
        }}
      />
    </div>
  );
}
