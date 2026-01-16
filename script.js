(() => {
  const app = document.getElementById('app');
  const loading = document.getElementById('loading');
  const navLinks = document.getElementById('navLinks');
  const year = document.getElementById('year');
  year.textContent = String(new Date().getFullYear());

  // Qatar clock
  const clockEl = document.getElementById('qatarClock');
  const dateEl = document.getElementById('qatarDate');
  const tz = 'Asia/Qatar';
  const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  function tick(){
    const now = new Date();
    clockEl.textContent = timeFmt.format(now);
    dateEl.textContent = dateFmt.format(now);
  }
  tick();
  setInterval(tick, 1000);

  function el(tag, attrs = {}, children = []){
    const node = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    }
    for (const child of children){
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function blocksToCard(blocks){
    const card = el('div', { class: 'card' });
    (blocks || []).forEach(b => {
      if (!b || !b.text) return;
      if (b.type === 'h1') card.appendChild(el('h1', {}, [b.text]));
      else if (b.type === 'h2') card.appendChild(el('h2', {}, [b.text]));
      else if (b.type === 'h3') card.appendChild(el('h3', {}, [b.text]));
      else if (b.type === 'ul'){
        const ul = el('ul');
        (b.items || []).forEach(it => ul.appendChild(el('li', {}, [it])));
        card.appendChild(ul);
      } else {
        card.appendChild(el('p', {}, [b.text]));
      }
    });
    if (!card.childNodes.length){
      card.appendChild(el('p', {}, ['TODO: Add text for this page in data/content.json']));
    }
    return card;
  }

  function buildNav(pages){
    navLinks.innerHTML = '';
    pages.forEach(p => {
      const a = el('a', { href: `#${p.id}` }, [p.navLabel || p.title || p.id]);
      navLinks.appendChild(a);
    });

    // Active state
    const anchors = Array.from(navLinks.querySelectorAll('a'));
    const map = new Map(anchors.map(a => [a.getAttribute('href')?.slice(1), a]));

    const io = new IntersectionObserver((entries) => {
      // pick most visible
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio - a.intersectionRatio));
      if (!visible.length) return;
      const id = visible[0].target.id;
      anchors.forEach(a => a.removeAttribute('aria-current'));
      const cur = map.get(id);
      if (cur) cur.setAttribute('aria-current', 'page');
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0.1,0.2,0.3,0.4,0.5] });

    pages.forEach(p => {
      const sec = document.getElementById(p.id);
      if (sec) io.observe(sec);
    });

    // smooth scroll
    navLinks.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const id = a.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function enableReveal(){
    const items = Array.from(document.querySelectorAll('.reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.12 });
    items.forEach(n => io.observe(n));
  }

  async function main(){
    try{
      const res = await fetch('data/content.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
      const data = await res.json();

      // Build pages
      app.innerHTML = '';
      data.pages.forEach((p) => {
        const section = el('section', { class: 'section reveal', id: p.id });
        const titleRow = el('div', { class: 'section-title' }, [
          el('h2', {}, [p.title || p.id]),
        ]);

        const page = el('div', { class: 'page' });
        const img = el('img', {
          class: 'page-media',
          src: p.image,
          alt: p.title || p.id,
          loading: p.id === 'page-01' ? 'eager' : 'lazy'
        });
        const overlay = el('div', { class: 'page-overlay' }, [ blocksToCard(p.blocks) ]);

        page.appendChild(img);
        page.appendChild(overlay);

        const cap = el('div', { class: 'caption' }, [p.caption || '']);

        section.appendChild(titleRow);
        section.appendChild(page);
        section.appendChild(cap);
        app.appendChild(section);
      });

      buildNav(data.pages);
      enableReveal();

    } catch (err){
      console.error(err);
      if (loading) loading.remove();
      app.innerHTML = '';
      app.appendChild(el('div', { class: 'loading' }, [
        'Could not load site content. ',
        err?.message || String(err)
      ]));
    } finally {
      if (loading) loading.remove();
    }
  }

  main();
})();
