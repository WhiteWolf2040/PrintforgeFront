import React, { useState, useEffect } from "react";
import "./Printforgelanding.css";
import logo from "./printforge-logo.png";
import {
  Printer,
  Zap,
  Clock,
  Ruler,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Gift,
  Home as HomeIcon,
  Layers,
  MessageCircle,
  ArrowRight,
  UploadCloud,
  FileCheck2,
  PackageCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  PrintForge 3D — Landing page                                       */
/*  Paleta: forja industrial (carbón + rojo óxido + blanco cálido)     */
/*  Tipografía: Oswald (display) / Inter (cuerpo) / JetBrains Mono     */
/*                                                                      */
/*  Requiere: printforge-logo.png en la misma carpeta que este archivo */
/* ------------------------------------------------------------------ */

/* ---------------- Datos de contacto reales ---------------- */
const WHATSAPP_NUMBER = "529999937698"; // +52 1 999 993 7698
const WHATSAPP_MESSAGE = "Hola, me interesa una cotización";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;
const CATALOG_LINK = "https://heyzine.com/flip-book/e61ec3f217.html";
const MAPS_LINK = "https://maps.app.goo.gl/J8DUymkxYykZ9jm8A";
const EMAIL = "printforge3d.1@gmail.com";
const EMAIL_LINK = `mailto:${EMAIL}`;

const TICKER_ITEMS = [
  "COTIZACIÓN EN MENOS DE 24H",
  "PLA · PETG · ABS",
  "PROTOTIPOS Y PIEZAS FUNCIONALES",
  "ENVÍOS A TODO MÉXICO",
];

const CATEGORIES = [
  {
    icon: Layers,
    title: "Prototipos & piezas funcionales",
    desc: "Del CAD a la pieza en tus manos. Tolerancias ajustadas, materiales técnicos y acabados listos para ensamblar.",
  },
  {
    icon: HomeIcon,
    title: "Decoración & hogar",
    desc: "Organizadores, portamacetas, lámparas y objetos que le dan personalidad a cada rincón.",
  },
  {
    icon: Gift,
    title: "Personalizados & regalos",
    desc: "Llaveros, figuras y piezas a medida con tu nombre, tu logo o tu idea exacta.",
  },
];

const PROCESS = [
  {
    icon: UploadCloud,
    title: "Sube tu diseño",
    desc: "Mándanos tu archivo STL o cuéntanos tu idea; si no tienes modelo, te ayudamos a crearlo.",
  },
  {
    icon: FileCheck2,
    title: "Recibe cotización",
    desc: "Calculamos material, tiempo y acabado. Precio claro antes de mover un solo gramo de filamento.",
  },
  {
    icon: Printer,
    title: "Producción",
    desc: "Imprimimos capa por capa con seguimiento del pedido, sin sorpresas de última hora.",
  },
  {
    icon: PackageCheck,
    title: "Entrega",
    desc: "Revisamos cada pieza antes de empacarla y te la hacemos llegar en el tiempo prometido.",
  },
];

const FEATURES = [
  {
    icon: Ruler,
    title: "Precisión de acabado",
    desc: "Calibración fina y postproceso cuidado en cada pieza que sale del taller.",
  },
  {
    icon: ShieldCheck,
    title: "Materiales certificados",
    desc: "Filamentos de proveedores confiables, seleccionados según el uso real de tu pieza.",
  },
  {
    icon: Clock,
    title: "Entrega puntual",
    desc: "Tiempos de producción claros desde la cotización, y los cumplimos.",
  },
  {
    icon: Zap,
    title: "Atención directa",
    desc: "Hablas con quien imprime tu pieza, no con un mostrador. Dudas resueltas rápido.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Llevé un diseño a medio terminar y me ayudaron a dejarlo listo para imprimir. El acabado quedó mejor de lo que esperaba.",
    name: "Renata C.",
    role: "Pieza personalizada",
  },
  {
    quote:
      "Pedí un lote de piezas funcionales para un proyecto de la escuela. Llegaron a tiempo y con las tolerancias que necesitaba.",
    name: "Julián M.",
    role: "Prototipo académico",
  },
  {
    quote:
      "La pieza que pedí quedo fantastica y me explicaron todo el proceso antes de empezar. Se nota que conocen el oficio.",
    name: "Paola R.",
    role: "Pieza personalizada",
  },
];

const FAQS = [
  {
    q: "¿Necesito tener un archivo 3D listo?",
    a: "No necesariamente. Si no cuentas con un modelo, podemos ayudarte a crearlo o adaptarlo a partir de tu idea o referencia.",
  },
  {
    q: "¿En qué materiales trabajan?",
    a: "Para impresión 3D usamos principalmente PLA, PETG y ABS. Dependiendo de tu proyecto, también podemos trabajar con otros materiales.",
  },
  {
    q: "¿Cuánto tarda un pedido?",
    a: "Depende de la complejidad. Piezas sencillas suelen salir en 1-3 días hábiles; proyectos personalizados pueden tomar de 3 a 7 días.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, enviamos a toda la República. También puedes coordinar recolección directa en el taller.",
  },
  {
    q: "¿Tienen precios para pedidos por volumen?",
    a: "Sí. Si necesitas varias piezas iguales o quieres colaborar en un proyecto más grande, contáctanos para una cotización especial.",
  },
];

/* ------------------------------------------------------------------ */

function useReveal() {
  const ref = React.useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`pf-reveal ${visible ? "pf-reveal-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* Logo real de PrintForge, con un resplandor animado detrás para el hero. */
function ForgeMark({ withGlow = true }) {
  return (
    <div className="pf-mark-wrap">
      {withGlow && <div className="pf-mark-glow" />}
      <img src={logo} alt="Logotipo de PrintForge 3D" className="pf-mark" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function PrintForgeLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "Servicios", "Proceso" y "Nosotros" siguen siendo anclas internas.
  // "Catálogo" abre el flipbook real en una pestaña nueva.
  const navLinks = [
    { label: "Servicios", href: "#servicios" },
    { label: "Catálogo", href: CATALOG_LINK, external: true },
    { label: "Proceso", href: "#proceso" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <div className="pf-root">
      {/* ---------------- Ticker ---------------- */}
      <div className="pf-ticker-wrap">
        <div className="pf-ticker">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div className="pf-ticker-item" key={i}>
              <span className="dot">●</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Nav ---------------- */}
      <nav className={`pf-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="pf-logo">
          <span className="pf-logo-badge">
            <img src={logo} alt="PrintForge" />
          </span>
          PrintForge
        </div>
        <ul className="pf-nav-links">
          {navLinks.map((l) => (
            <li key={l.href}>
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ) : (
                <a href={l.href}>{l.label}</a>
              )}
            </li>
          ))}
        </ul>
        <a
          className="pf-btn pf-btn--dark desktop-only"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cotizar ahora <ArrowRight size={14} />
        </a>
        <button
          className="pf-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      <div className={`pf-mobile-menu ${menuOpen ? "open" : ""}`}>
        {navLinks.map((l) =>
          l.external ? (
            <a
              href={l.href}
              key={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ) : (
            <a href={l.href} key={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          )
        )}
        <a
          className="pf-btn pf-btn--dark"
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
        >
          Cotizar ahora <ArrowRight size={14} />
        </a>
      </div>

      {/* ---------------- Hero ---------------- */}
      <header className="pf-hero" id="inicio">
        <div className="pf-hero-noise" />
        <div className="pf-hero-inner">
          <div>
            <span className="pf-eyebrow">Impresión 3D </span>
            <h1>
              De la idea a la pieza,
              <br />
              <em>capa por capa.</em>
            </h1>
            <p className="lead">
              Convertimos tu diseño, tu boceto o solo tu idea en una pieza real. Prototipos,
              piezas funcionales y objetos personalizados, hechos con precisión de taller.
            </p>

            <div className="pf-hero-ctas">
              <a
                className="pf-btn pf-btn--primary"
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cotiza tu proyecto <ArrowRight size={15} />
              </a>
              <a
                className="pf-btn pf-btn--secondary"
                href={CATALOG_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver catálogo
              </a>
            </div>

            <div className="pf-hero-specs">
              <div>
                <span className="num pf-mono">±0.1mm</span>
                <span className="label">Precisión de capa</span>
              </div>
              <div>
                <span className="num pf-mono">24h</span>
                <span className="label">Cotización</span>
              </div>
              <div>
                <span className="num pf-mono">3</span>
                <span className="label">Materiales base</span>
              </div>
            </div>
          </div>
          <div className="pf-hero-visual">
            <ForgeMark />
          </div>
        </div>
      </header>

      {/* ---------------- Categories ---------------- */}
      <section className="pf-section" id="catalogo">
        <Reveal>
          <span className="pf-eyebrow">Qué imprimimos</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16 }}>
            Tres caminos, una misma pieza bien hecha
          </h2>
        </Reveal>
        <div className="pf-cat-grid">
          {CATEGORIES.map((c, i) => (
            <Reveal delay={i * 120} key={c.title}>
              <div className="pf-cat-card">
                <div className="pf-cat-icon">
                  <c.icon size={22} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="pf-section" id="servicios">
        <Reveal>
          <span className="pf-eyebrow">Servicios</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16 }}>
            Un taller y varias formas de forjar tu idea
          </h2>
        </Reveal>
        <div className="pf-services-grid">
          <center>
            <Reveal>
              <div className="pf-service-card">
                <span className="pf-service-num pf-mono">01 — Impresión 3D</span>
                <h3>Prototipos, repuestos y piezas a medida</h3>
                <p>
                  Imprimimos en PLA, PETG y ABS según el uso real de tu pieza: resistencia,
                  acabado o costo. Ideal para estudiantes, emprendedores y pymes.
                </p>
                <a
                  className="pf-service-link"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Solicitar impresión <ArrowRight size={14} />
                </a>
              </div>
            </Reveal>
          </center>
        </div>
      </section>

      {/* ---------------- Process ---------------- */}
      <section className="pf-section" id="proceso">
        <Reveal>
          <span className="pf-eyebrow">Cómo trabajamos</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16, color: "#e21a1a" }}>
            De tu idea a la entrega, sin vueltas
          </h2>
        </Reveal>
        <div className="pf-process-grid">
          {PROCESS.map((p, i) => (
            <Reveal delay={i * 90} key={p.title}>
              <div className="pf-process-step">
                <span className="pf-process-index pf-mono">0{i + 1}</span>
                <div className="pf-process-icon">
                  <p.icon size={19} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="pf-features" id="nosotros">
        <div className="pf-section" style={{ paddingBottom: 96 }}>
          <Reveal>
            <span className="pf-eyebrow">Por qué PrintForge</span>
            <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16 }}>
              Cuidamos cada capa como si fuera la última
            </h2>
          </Reveal>
          <div className="pf-feature-grid">
            {FEATURES.map((f, i) => (
              <Reveal delay={i * 80} key={f.title}>
                <div className="pf-feature-item">
                  <f.icon size={24} />
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Testimonials ---------------- */}
      <section className="pf-section">
        <Reveal>
          <span className="pf-eyebrow">Clientes</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16, color: "#e21a1a" }}>
            Lo que dicen quienes ya forjaron su idea
          </h2>
        </Reveal>
        <div className="pf-testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal delay={i * 90} key={t.name}>
              <div className="pf-testi-card">
                <p className="quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="pf-testi-name">{t.name}</div>
                <div className="pf-testi-role">{t.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA banner ---------------- */}
      <section className="pf-section" style={{ paddingTop: 0 }}>
        <Reveal>
          <div className="pf-cta-banner">
            <h2>¿Tienes una idea? Vamos a forjarla.</h2>
            <p>
              Mándanos tu diseño o cuéntanos qué necesitas. Te respondemos con una
              cotización clara en menos de 24 horas.
            </p>
            <a
              className="pf-btn pf-btn--light"
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> Escríbenos por WhatsApp
            </a>
          </div>
        </Reveal>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="pf-section">
        <Reveal>
          <span className="pf-eyebrow">Preguntas frecuentes</span>
          <h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 16, color: "#e21a1a" }}>
            Antes de que preguntes
          </h2>
        </Reveal>
        <div className="pf-faq-list">
          {FAQS.map((f, i) => (
            <div className="pf-faq-item" key={f.q}>
              <button
                className={`pf-faq-q ${openFaq === i ? "open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              >
                {f.q}
                <ChevronDown size={18} />
              </button>
              <div className={`pf-faq-a ${openFaq === i ? "open" : ""}`}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="pf-footer" id="contacto">
        <div className="pf-footer-grid">
          <div>
            <div className="pf-logo" style={{ marginBottom: 16 }}>
              <span className="pf-logo-badge">
                <img src={logo} alt="PrintForge" />
              </span>
              PrintForge
            </div>
            <p>
              Taller de impresión 3D donde Convertimos ideas en piezas reales,
              capa por capa.
            </p>
          </div>
          <div>
            <h4>Navegación</h4>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ) : (
                    <a href={l.href}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>
                <a href={EMAIL_LINK}>{EMAIL}</a>
              </li>
              <li>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  WhatsApp del taller
                </a>
              </li>
              <li>
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  Ubicación del taller
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Horario</h4>
            <ul>
              <li style={{ color: "var(--ash-dark)" }}>Lun – Vie: 9am – 6pm</li>
              <li style={{ color: "var(--ash-dark)" }}>Sáb: 9am – 1pm</li>
            </ul>
          </div>
        </div>
        <div className="pf-footer-bottom">
          <span>© PrintForge 3D</span>
          <span>Diseño e impresión hechos a mano, con cuidado</span>
        </div>
      </footer>
    </div>
  );
}