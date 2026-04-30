'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const canvasRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  /* ── Canvas bubble animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + Math.random() * 120;
        this.r = Math.random() * 45 + 12;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(Math.random() * 0.7 + 0.15);
        this.opacity = Math.random() * 0.13 + 0.03;
        const c = ['rgba(0,232,255,', 'rgba(80,255,160,', 'rgba(170,238,0,', 'rgba(0,200,255,', 'rgba(255,255,255,'];
        this.color = c[Math.floor(Math.random() * c.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -this.r * 2) this.reset();
      }
      draw() {
        const g = ctx.createRadialGradient(
          this.x - this.r * 0.3, this.y - this.r * 0.35, this.r * 0.05,
          this.x, this.y, this.r
        );
        g.addColorStop(0, this.color + (this.opacity * 2.2) + ')');
        g.addColorStop(0.5, this.color + this.opacity + ')');
        g.addColorStop(1, this.color + '0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        // specular highlight
        ctx.beginPath();
        ctx.arc(this.x - this.r * 0.32, this.y - this.r * 0.32, this.r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fill();
        // secondary small highlight
        ctx.beginPath();
        ctx.arc(this.x - this.r * 0.18, this.y - this.r * 0.52, this.r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      }
    }

    resize();
    for (let i = 0; i < 28; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  /* ── Custom cursor ── */
  useEffect(() => {
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    };

    const lerp = (a, b, t) => a + (b - a) * t;
    const trackRing = () => {
      rx = lerp(rx, mx, 0.13);
      ry = lerp(ry, my, 0.13);
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      raf = requestAnimationFrame(trackRing);
    };

    const onEnter = () => ring.classList.add('ring-hover');
    const onLeave = () => ring.classList.remove('ring-hover');

    document.addEventListener('mousemove', onMove);
    const interactables = document.querySelectorAll('a, button, .btn-aero, .tech-pill, .proj-card, .contact-link-item');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    trackRing();
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ── Navbar scroll effect ── */
  useEffect(() => {
    const nav = document.getElementById('navbar');
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Reveal on scroll ── */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Skill bar animation ── */
  useEffect(() => {
    const bars = document.querySelectorAll('.bar-fill');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.dataset.w + '%'; } }),
      { threshold: 0.4 }
    );
    bars.forEach(b => obs.observe(b));
    return () => obs.disconnect();
  }, []);

  /* ── Active nav link on scroll ── */
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[href]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            links.forEach(l => l.classList.remove('active'));
            document.querySelector(`.nav-link[href="#${e.target.id}"]`)?.classList.add('active');
          }
        });
      },
      { threshold: 0.45 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  /* ── Form ── */
  const handleInput = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormMsg({ text: '⚠️ Por favor, preencha os campos obrigatórios.', type: 'error' });
      return;
    }
    setFormMsg({ text: '✅ Mensagem enviada! Retornarei em breve.', type: 'success' });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setFormMsg({ text: '', type: '' }), 5000);
  };

  /* ── Smooth scroll ── */
  const scrollTo = (e, id) => {
    e.preventDefault();
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ═══ BACKGROUND LAYERS ═══ */}
      <canvas id="bg-canvas" ref={canvasRef} />
      <div className="bg-gradient" />
      <div className="bg-aurora">
        <div className="aurora-orb aurora-1" />
        <div className="aurora-orb aurora-2" />
        <div className="aurora-orb aurora-3" />
        <div className="aurora-orb aurora-4" />
        <div className="aurora-orb aurora-5" />
      </div>
      <div className="light-rays">
        {[1,2,3,4,5].map(n => <div key={n} className={`ray ray-${n}`} />)}
      </div>

      {/* ═══ NAVIGATION ═══ */}
      <nav className="glass-nav" id="navbar">
        <div className="nav-container">
          <a href="#hero" className="nav-logo" onClick={e => scrollTo(e, 'hero')}>
            <span className="logo-diamond">◈</span>
            <span className="logo-text">LUCAS<span className="logo-accent">NI</span></span>
          </a>

          <ul className={`nav-links${mobileOpen ? ' open' : ''}`}>
            {[['hero','Início'],['about','Sobre'],['skills','Skills'],['projects','Projetos'],['contact','Contato']].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className={`nav-link${id === 'hero' ? ' active' : ''}`} onClick={e => scrollTo(e, id)}>{label}</a>
              </li>
            ))}
          </ul>

          <button className="nav-toggle" id="nav-toggle" aria-label="Abrir menu" onClick={() => setMobileOpen(o => !o)}>
            <span style={mobileOpen ? { transform: 'rotate(45deg) translate(5px,5px)' } : {}} />
            <span style={mobileOpen ? { opacity: 0 } : {}} />
            <span style={mobileOpen ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}} />
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="hero" className="hero-section">
        <div className="hero-bg-rings">
          <div className="bg-ring bg-ring-1" />
          <div className="bg-ring bg-ring-2" />
          <div className="bg-ring bg-ring-3" />
        </div>

        <div className="hero-content reveal">
          <div className="availability-badge">
            <span className="badge-pulse" />
            <span>Disponível para projetos</span>
          </div>

          <h1 className="hero-title">
            <span className="title-greeting">Olá, eu sou</span>
            <span className="title-name chrome-text">Lucas N. I.</span>
          </h1>

          <div className="hero-subtitle-row">
            <div className="subtitle-line" />
            <p className="hero-subtitle">Full-Stack Developer &amp; Digital Artist</p>
            <div className="subtitle-line" />
          </div>

          <p className="hero-description">
            Criando experiências digitais que combinam código limpo,<br />
            design inovador e a magia do futuro que nos prometeram.
          </p>

          <div className="hero-cta">
            <a href="#projects" className="btn-aero btn-primary-aero" onClick={e => scrollTo(e, 'projects')}>
              <i className="fas fa-rocket" />
              <span>Ver Projetos</span>
              <div className="btn-gloss" />
            </a>
            <a href="#contact" className="btn-aero btn-secondary-aero" onClick={e => scrollTo(e, 'contact')}>
              <i className="fas fa-paper-plane" />
              <span>Falar Comigo</span>
              <div className="btn-gloss" />
            </a>
          </div>

          <div className="hero-stats-row">
            {[['50+','Projetos'],['5+','Anos de Exp.'],['30+','Clientes']].map(([n, l], i) => (
              <>
                {i > 0 && <div key={`sep-${i}`} className="stat-sep" />}
                <div key={l} className="stat-glass">
                  <span className="stat-num">{n}</span>
                  <span className="stat-lbl">{l}</span>
                </div>
              </>
            ))}
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="profile-frame">
            <div className="profile-ring ring-outer">
              <div className="ring-ornament ring-ornament-tl" />
              <div className="ring-ornament ring-ornament-tr" />
              <div className="ring-ornament ring-ornament-bl" />
              <div className="ring-ornament ring-ornament-br" />
            </div>
            <div className="profile-ring ring-middle" />
            <div className="profile-ring ring-inner" />
            <div className="profile-avatar">
              <div className="avatar-placeholder"><i className="fas fa-user" /></div>
              <div className="avatar-glow" />
            </div>
          </div>
          <div className="float-chip chip-js"><i className="fab fa-js" /><span>JavaScript</span></div>
          <div className="float-chip chip-node"><i className="fab fa-node-js" /><span>Node.js</span></div>
          <div className="float-chip chip-react"><i className="fab fa-react" /><span>React</span></div>
          <div className="float-chip chip-python"><i className="fab fa-python" /><span>Python</span></div>
        </div>

        <div className="scroll-hint">
          <span className="scroll-label">Scroll</span>
          <div className="scroll-track"><div className="scroll-ball" /></div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="page-section about-section">
        <div className="grid-overlay" />
        <div className="section-wrap">
          <header className="section-header reveal">
            <div className="section-eyebrow">◆ Sobre Mim ◆</div>
            <h2 className="section-title chrome-text">Quem sou eu?</h2>
            <div className="section-rule" />
          </header>

          <div className="about-layout">
            <div className="about-main glass-card reveal">
              <div className="glass-shine" />
              <div className="card-corner-tl" />
              <div className="card-corner-br" />
              <p>Sou um desenvolvedor apaixonado por criar soluções digitais que combinam <strong>funcionalidade</strong> e <strong>beleza</strong>. Com mais de 5 anos de experiência, trabalho com tecnologias modernas para construir aplicações web e mobile robustas.</p>
              <p>Minha jornada começou com curiosidade sobre como as coisas funcionam &quot;por baixo do capô&quot; — e hoje utilizo esse conhecimento para criar experiências únicas que encantam usuários e surpreendem clientes.</p>
              <div className="about-chips">
                {[['fa-map-marker-alt','Brasil'],['fa-graduation-cap','Ciência da Computação'],['fa-briefcase','Freelancer'],['fa-heart','Open Source']].map(([icon, label]) => (
                  <span key={label} className="chip"><i className={`fas ${icon}`} /> {label}</span>
                ))}
              </div>
              <a href="#" className="btn-aero btn-primary-aero btn-sm">
                <i className="fas fa-download" /><span>Download CV</span>
                <div className="btn-gloss" />
              </a>
            </div>

            <div className="about-stats">
              {[
                ['fa-code','50K+','Linhas de Código'],
                ['fa-trophy','15+','Prêmios & Reconhecimentos'],
                ['fa-coffee','∞','Cafés Consumidos'],
                ['fa-star','4.9★','Avaliação Média'],
              ].map(([icon, num, label]) => (
                <div key={label} className="mini-stat-card glass-card reveal">
                  <div className="glass-shine" />
                  <div className="msc-icon"><i className={`fas ${icon}`} /></div>
                  <div className="msc-data">
                    <span className="msc-num">{num}</span>
                    <span className="msc-lbl">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SKILLS ═══ */}
      <section id="skills" className="page-section skills-section">
        <div className="section-wrap">
          <header className="section-header reveal">
            <div className="section-eyebrow">◆ Habilidades ◆</div>
            <h2 className="section-title chrome-text">Arsenal Técnico</h2>
            <div className="section-rule" />
          </header>

          <div className="skills-grid">
            {[
              {
                icon: 'fa-globe', title: 'Frontend',
                skills: [['fab fa-html5','HTML5 / CSS3',95],['fab fa-js','JavaScript / TypeScript',92],['fab fa-react','React / Next.js',88],['fab fa-vuejs','Vue.js',75]]
              },
              {
                icon: 'fa-server', title: 'Backend',
                skills: [['fab fa-node-js','Node.js / Express',90],['fab fa-python','Python / Django',82],['fas fa-database','PostgreSQL / MongoDB',85],['fas fa-cloud','AWS / Docker',78]]
              },
              {
                icon: 'fa-paint-brush', title: 'Design & Tools',
                skills: [['fab fa-figma','Figma / Adobe XD',88],['fab fa-git-alt','Git / GitHub',93],['fas fa-mobile-alt','UI/UX Design',80],['fas fa-shield-alt','Security / Testing',76]]
              },
            ].map(cat => (
              <div key={cat.title} className="skill-cat glass-card reveal">
                <div className="glass-shine" />
                <div className="card-corner-tl" />
                <div className="cat-head">
                  <div className="cat-icon"><i className={`fas ${cat.icon}`} /></div>
                  <h3 className="cat-title">{cat.title}</h3>
                </div>
                <div className="skill-bars">
                  {cat.skills.map(([ic, name, pct]) => (
                    <div key={name} className="skill-row">
                      <div className="skill-meta">
                        <span><i className={ic} /> {name}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" data-w={pct} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="tech-pills reveal">
            {[['fab fa-js','JavaScript'],['fab fa-react','React'],['fab fa-node-js','Node.js'],['fab fa-python','Python'],['fab fa-docker','Docker'],['fab fa-git-alt','Git'],['fab fa-aws','AWS'],['fab fa-linux','Linux'],['fab fa-figma','Figma'],['fab fa-vuejs','Vue.js']].map(([ic, label]) => (
              <div key={label} className="tech-pill"><i className={ic} /><span>{label}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═══ */}
      <section id="projects" className="page-section projects-section">
        <div className="grid-overlay" />
        <div className="section-wrap">
          <header className="section-header reveal">
            <div className="section-eyebrow">◆ Projetos ◆</div>
            <h2 className="section-title chrome-text">Trabalhos Recentes</h2>
            <div className="section-rule" />
          </header>

          <div className="projects-grid">
            {[
              {
                num:'01', icon:'fa-chart-line', tags:['React','Node.js','PostgreSQL'],
                title:'AquaFlow Dashboard', featured: false,
                desc:'Plataforma de análise de dados em tempo real com visualizações interativas e sistema de alertas automatizados para monitoramento empresarial.',
              },
              {
                num:'02', icon:'fa-layer-group', tags:['Next.js','TypeScript','Prisma','AWS'],
                title:'NebulaSaaS Platform', featured: true,
                desc:'SaaS completo para gestão empresarial com autenticação avançada, pagamentos integrados e painel administrativo totalmente customizável.',
              },
              {
                num:'03', icon:'fa-robot', tags:['Python','AI/ML','FastAPI'],
                title:'CrystalAI Assistant', featured: false,
                desc:'Assistente virtual inteligente com processamento de linguagem natural e capacidades de aprendizado adaptativo em tempo real.',
              },
            ].map(proj => (
              <article key={proj.num} className={`proj-card glass-card reveal${proj.featured ? ' featured-card' : ''}`}>
                <div className="glass-shine" />
                <div className="card-corner-tl" />
                {proj.featured && <div className="featured-ribbon">⭐ Destaque</div>}
                <div className="proj-thumb">
                  <div className="proj-thumb-inner"><i className={`fas ${proj.icon}`} /></div>
                  <div className="proj-num">{proj.num}</div>
                  <div className="proj-overlay">
                    <a href="#" className="btn-icon-aero" aria-label="Ver ao vivo"><i className="fas fa-external-link-alt" /></a>
                    <a href="#" className="btn-icon-aero" aria-label="Ver código"><i className="fab fa-github" /></a>
                  </div>
                </div>
                <div className="proj-body">
                  <div className="proj-tags">{proj.tags.map(t => <span key={t} className="proj-tag">{t}</span>)}</div>
                  <h3 className="proj-title">{proj.title}</h3>
                  <p className="proj-desc">{proj.desc}</p>
                  <div className="proj-footer">
                    <a href="#" className="btn-aero btn-primary-aero btn-sm">
                      <i className="fas fa-eye" /><span>Ver Projeto</span>
                      <div className="btn-gloss" />
                    </a>
                    <a href="#" className="proj-source-link"><i className="fab fa-github" /><span>Source</span></a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="projects-cta reveal">
            <a href="#" className="btn-aero btn-secondary-aero">
              <i className="fab fa-github" /><span>Ver Todos no GitHub</span>
              <div className="btn-gloss" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="page-section contact-section">
        <div className="section-wrap">
          <header className="section-header reveal">
            <div className="section-eyebrow">◆ Contato ◆</div>
            <h2 className="section-title chrome-text">Vamos Trabalhar Juntos?</h2>
            <div className="section-rule" />
          </header>

          <div className="contact-layout">
            <div className="contact-info glass-card reveal">
              <div className="glass-shine" />
              <div className="card-corner-tl" />
              <h3 className="contact-info-title">Entre em Contato</h3>
              <p className="contact-info-text">Estou sempre aberto a novos projetos, colaborações criativas e oportunidades incríveis. Não hesite em me contatar!</p>
              <div className="contact-links">
                {[
                  ['fa-envelope','Email','lucas@example.com','mailto:lucas@example.com'],
                  ['fab fa-linkedin','LinkedIn','/in/lucasisrael','#'],
                  ['fab fa-github','GitHub','github.com/lucasisrael','#'],
                  ['fab fa-discord','Discord','lucasisrael#0001','#'],
                ].map(([ic, label, val, href]) => (
                  <a key={label} href={href} className="contact-link-item">
                    <div className="cli-icon"><i className={ic.startsWith('fab') ? ic : `fas ${ic}`} /></div>
                    <div className="cli-text">
                      <span className="cli-label">{label}</span>
                      <span className="cli-value">{val}</span>
                    </div>
                    <i className="fas fa-chevron-right cli-arrow" />
                  </a>
                ))}
              </div>
            </div>

            <div className="contact-form-card glass-card reveal">
              <div className="glass-shine" />
              <div className="card-corner-tl" />
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name"><i className="fas fa-user" /> Nome</label>
                    <div className="input-wrap">
                      <input type="text" id="name" name="name" className="aero-input" placeholder="Seu nome" value={formData.name} onChange={handleInput} required autoComplete="off" />
                      <div className="input-glow-border" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email"><i className="fas fa-envelope" /> Email</label>
                    <div className="input-wrap">
                      <input type="email" id="email" name="email" className="aero-input" placeholder="seu@email.com" value={formData.email} onChange={handleInput} required autoComplete="off" />
                      <div className="input-glow-border" />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="subject"><i className="fas fa-tag" /> Assunto</label>
                  <div className="input-wrap">
                    <input type="text" id="subject" name="subject" className="aero-input" placeholder="Sobre o que você quer falar?" value={formData.subject} onChange={handleInput} autoComplete="off" />
                    <div className="input-glow-border" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="message"><i className="fas fa-comment-alt" /> Mensagem</label>
                  <div className="input-wrap">
                    <textarea id="message" name="message" className="aero-input aero-textarea" placeholder="Sua mensagem..." value={formData.message} onChange={handleInput} required rows={5} />
                    <div className="input-glow-border" />
                  </div>
                </div>
                <button type="submit" className="btn-aero btn-primary-aero btn-full">
                  <i className="fas fa-paper-plane" /><span>Enviar Mensagem</span>
                  <div className="btn-gloss" />
                </button>
                {formMsg.text && (
                  <div className={`form-feedback ${formMsg.type}`}>{formMsg.text}</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="site-footer">
        <div className="footer-glow-line" />
        <div className="footer-wrap">
          <div className="footer-top">
            <a href="#hero" className="nav-logo footer-logo" onClick={e => scrollTo(e, 'hero')}>
              <span className="logo-diamond">◈</span>
              <span className="logo-text">LUCAS<span className="logo-accent">NI</span></span>
            </a>
            <nav className="footer-nav">
              {[['hero','Início'],['about','Sobre'],['skills','Skills'],['projects','Projetos'],['contact','Contato']].map(([id, label]) => (
                <a key={id} href={`#${id}`} onClick={e => scrollTo(e, id)}>{label}</a>
              ))}
            </nav>
            <div className="footer-social">
              {[['fab fa-github','GitHub'],['fab fa-linkedin','LinkedIn'],['fab fa-twitter','Twitter'],['fab fa-instagram','Instagram']].map(([ic, label]) => (
                <a key={label} href="#" className="social-btn" aria-label={label}><i className={ic} /></a>
              ))}
            </div>
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom">
            <p>© 2025 Lucas N. I. — Feito com <span className="heart">♥</span> e muito ☕</p>
            <p className="footer-tech">Powered by Next.js &amp; React</p>
          </div>
        </div>
      </footer>

      {/* ═══ CUSTOM CURSOR ═══ */}
      <div className="cursor-dot" ref={cursorDotRef} />
      <div className="cursor-ring" ref={cursorRingRef} />
    </>
  );
}
