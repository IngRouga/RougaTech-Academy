/* RougaTech Academy — interactions (vanilla JS, aucune dépendance) */
{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const body = document.body;

  /* header + scroll progress + floating WhatsApp + sticky buy bar */
  const hdr = document.querySelector('.hdr');
  const bar = document.querySelector('.progress');
  const fab = document.querySelector('.wa-fab');
  const sticky = document.querySelector('.sticky-buy');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (hdr) hdr.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (fab) fab.classList.toggle('show', y > 500);
    if (sticky) sticky.classList.toggle('show', y > innerHeight * 0.9 && y < h - 400);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (sticky) body.classList.add('has-sticky');

  /* mobile menu */
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
      body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false');
    }));
  }

  /* split headings into words */
  document.querySelectorAll('[data-split]').forEach(el => {
    el.classList.add('split');
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = p; w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('swap')) walk(n);
      });
    };
    walk(el);
    el.querySelectorAll('.w > span').forEach((s, k) => s.style.transitionDelay = (k * 0.06) + 's');
  });

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv,[data-split]').forEach(el => io.observe(el));

  /* animated counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, raw = 'raw' in el.dataset, end = parseFloat(el.dataset.count), pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    cio.unobserve(el);
    const fmt = v => raw ? String(v) : v.toLocaleString('fr-FR');
    if (reduce) { el.textContent = pre + fmt(end) + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + fmt(v) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* rotating word in hero */
  const swap = document.querySelector('.swap[data-words]');
  if (swap && !reduce) {
    const words = swap.dataset.words.split('|'); let k = 0;
    setInterval(() => {
      k = (k + 1) % words.length;
      const s = document.createElement('span'); s.textContent = words[k];
      swap.replaceChildren(s);
    }, 2600);
  }

  /* course filters */
  const fbtns = document.querySelectorAll('.filters button');
  fbtns.forEach(b => b.addEventListener('click', () => {
    fbtns.forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    document.querySelectorAll('.course').forEach(c => {
      c.classList.toggle('hide', f !== 'all' && !c.dataset.cat.split(' ').includes(f));
    });
  }));

  /* steps progress line */
  const steps = document.querySelector('.steps');
  if (steps) {
    const sio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      sio.disconnect();
      const items = steps.querySelectorAll('.step'), prog = steps.querySelector('.prog');
      if (prog) prog.style.width = 'calc(100% - 56px)';
      items.forEach((s, k) => setTimeout(() => s.classList.add('on'), reduce ? 0 : 300 + k * 380));
    }), { threshold: 0.4 });
    sio.observe(steps);
  }

  if (fine && !reduce) {
    /* 3D tilt on course cards */
    document.querySelectorAll('.course,.sc').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    /* magnetic buttons */
    document.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });

    /* hero parallax on the card stack */
    const stack = document.querySelector('.stack3d');
    if (stack) {
      addEventListener('mousemove', e => {
        const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
        stack.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      });
      stack.style.transition = 'transform .8s cubic-bezier(.2,.8,.2,1)';
      stack.style.transformStyle = 'preserve-3d';
    }

    /* custom cursor */
    const cur = document.createElement('div'); cur.className = 'cur'; body.appendChild(cur);
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; });
    const loop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; requestAnimationFrame(loop); };
    loop();
    document.querySelectorAll('a,button,summary').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('big'));
    });
  }

  /* contact form → WhatsApp message (no backend) */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const msg = `Bonjour RougaTech Academy 👋\n\nNom : ${d.get('nom')}\nWhatsApp : ${d.get('tel')}\nFormation : ${d.get('formation')}\n\n${d.get('message') || ''}`;
      const url = 'https://wa.me/22791340905?text=' + encodeURIComponent(msg);
      const out = document.querySelector('#form-out');
      if (out) { out.hidden = false; out.querySelector('a').href = url; }
      window.location.href = url;
    });
  }

  /* year */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}
