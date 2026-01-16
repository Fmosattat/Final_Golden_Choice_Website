(() => {
  const app = document.getElementById('app');
  const loading = document.getElementById('loading');
  const navLinks = document.getElementById('navLinks');
  const brandLogo = document.getElementById('brandLogo');
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

  function buildNav(sections){
    navLinks.innerHTML = '';
    sections.forEach(section => {
      const a = el('a', { href: `#${section.id}` }, [section.navLabel || section.title || section.id]);
      navLinks.appendChild(a);
    });

    // Active state
    const anchors = Array.from(navLinks.querySelectorAll('a'));
    const map = new Map(anchors.map(a => [a.getAttribute('href')?.slice(1), a]));

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => (b.intersectionRatio - a.intersectionRatio));
      if (!visible.length) return;
      const id = visible[0].target.id;
      anchors.forEach(a => a.removeAttribute('aria-current'));
      const cur = map.get(id);
      if (cur) cur.setAttribute('aria-current', 'page');
    }, { rootMargin: '-40% 0px -55% 0px', threshold: [0.1,0.2,0.3,0.4,0.5] });

    sections.forEach(section => {
      const sec = document.getElementById(section.id);
      if (sec) io.observe(sec);
    });

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

  function createLightbox(items){
    const overlay = el('div', { class: 'lightbox-overlay' });
    const img = el('img', { class: 'lightbox-image', alt: '' });
    const closeBtn = el('button', { class: 'lightbox-close', type: 'button', 'aria-label': 'Close' }, ['✕']);
    const prevBtn = el('button', { class: 'lightbox-nav prev', type: 'button', 'aria-label': 'Previous' }, ['‹']);
    const nextBtn = el('button', { class: 'lightbox-nav next', type: 'button', 'aria-label': 'Next' }, ['›']);
    const content = el('div', { class: 'lightbox-content', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Certificate viewer' }, [
      prevBtn,
      img,
      nextBtn,
      closeBtn
    ]);
    const modal = el('div', { class: 'lightbox', 'aria-hidden': 'true' }, [overlay, content]);
    document.body.appendChild(modal);

    let currentIndex = 0;
    let lastFocus = null;

    function update(){
      const item = items[currentIndex];
      img.src = item.src;
      img.alt = item.alt || 'Certificate image';
    }

    function open(index){
      if (!items.length) return;
      currentIndex = index;
      update();
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      closeBtn.focus();
    }

    function close(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function prev(){
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      update();
    }

    function next(){
      currentIndex = (currentIndex + 1) % items.length;
      update();
    }

    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') prev();
      if (event.key === 'ArrowRight') next();
    });

    return { open };
  }

  function renderHero(section){
    const wrapper = el('div', { class: 'hero reveal' });
    const heroGrid = el('div', { class: 'hero-grid' });
    const heroText = el('div', { class: 'hero-text' });
    heroText.appendChild(el('h1', {}, [section.title || 'Home']));
    heroText.appendChild(el('p', { class: 'hero-tagline' }, [section.tagline || 'TODO: Add home tagline text.']));
    if (section.subtitle) {
      heroText.appendChild(el('p', { class: 'hero-subtitle' }, [section.subtitle]));
    }
    heroGrid.appendChild(heroText);
    if (section.heroImage) {
      heroGrid.appendChild(el('img', { class: 'hero-image', src: section.heroImage, alt: 'Golden Choice overview' }));
    }
    wrapper.appendChild(heroGrid);
    return wrapper;
  }

  function renderAbout(section){
    const wrapper = el('div', { class: 'about-grid reveal' });
    (section.items || []).forEach(item => {
      const card = el('div', { class: 'info-card' }, [
        el('h3', {}, [item.title || '']),
        el('p', {}, [item.text || 'TODO: Add about text.'])
      ]);
      wrapper.appendChild(card);
    });
    return wrapper;
  }

  function renderLeadership(section){
    const wrapper = el('div', { class: 'leadership-grid reveal' });
    (section.leaders || []).forEach(leader => {
      const card = el('div', { class: 'leader-card' }, [
        el('h3', {}, [leader.role || 'Leadership']),
        el('p', { class: 'leader-name' }, [leader.name || 'TODO: Add leader name.']),
        el('p', {}, [leader.bio || 'TODO: Add leader bio.'])
      ]);
      wrapper.appendChild(card);
    });
    return wrapper;
  }

  function renderServices(section, services){
    const wrapper = el('div', { class: 'services-block reveal' });

    const infoGrid = el('div', { class: 'info-grid' }, [
      el('div', { class: 'info-card' }, [
        el('h3', {}, ['Wings']),
        el('p', {}, [section.wings || 'TODO: Add Wings text.'])
      ]),
      el('div', { class: 'info-card' }, [
        el('h3', {}, ['Industries']),
        el('p', {}, [section.industries || 'TODO: Add industries text.'])
      ]),
      el('div', { class: 'info-card' }, [
        el('h3', {}, ['Clients']),
        el('p', {}, [section.clients || 'TODO: Add clients text.'])
      ]),
      el('div', { class: 'info-card' }, [
        el('h3', {}, ['Recruitment Process']),
        el('p', {}, [section.recruitmentProcess || 'TODO: Add recruitment process text.'])
      ])
    ]);

    const tabList = el('div', { class: 'service-tabs', role: 'tablist', 'aria-label': 'Services' });
    const panel = el('div', { class: 'service-detail', role: 'region', 'aria-live': 'polite' });

    const serviceItems = services || [];

    function setActive(index){
      const buttons = Array.from(tabList.querySelectorAll('button'));
      buttons.forEach((btn, idx) => {
        const active = idx === index;
        btn.setAttribute('aria-selected', String(active));
        btn.classList.toggle('active', active);
      });
      const item = serviceItems[index];
      panel.innerHTML = '';
      panel.appendChild(el('h4', {}, [item?.title || 'Service']));
      panel.appendChild(el('p', {}, [item?.description || 'TODO: Add service description.']));
    }

    serviceItems.forEach((service, index) => {
      const button = el('button', {
        type: 'button',
        role: 'tab',
        'aria-selected': 'false'
      }, [service.title || `Service ${index + 1}`]);
      button.addEventListener('click', () => setActive(index));
      tabList.appendChild(button);
    });

    wrapper.appendChild(infoGrid);
    wrapper.appendChild(tabList);
    wrapper.appendChild(panel);

    if (serviceItems.length) {
      setActive(0);
    }

    return wrapper;
  }

  function renderCertificateGallery(items, lightbox){
    const wrapper = el('div', { class: 'certificates reveal' });
    const grid = el('div', { class: 'cert-grid' });
    (items || []).forEach((item, index) => {
      const button = el('button', { class: 'cert-card', type: 'button' });
      const img = el('img', { src: item.src, alt: item.alt || `Certificate image ${index + 1}`, loading: 'lazy' });
      button.appendChild(img);
      button.addEventListener('click', () => lightbox.open(index));
      grid.appendChild(button);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  function renderLogoStrip(items){
    const wrapper = el('div', { class: 'logo-strip reveal' });
    (items || []).forEach((item, index) => {
      const img = el('img', {
        src: item.src,
        alt: item.alt || `Logo ${index + 1}`,
        loading: 'lazy'
      });
      wrapper.appendChild(img);
    });
    return wrapper;
  }

  function renderContactSection(contact){
    const wrapper = el('div', { class: 'contact-grid reveal' });
    const cards = el('div', { class: 'contact-cards' });

    if (contact?.phone) {
      const phoneLink = contact.phone.replace(/\s+/g, '');
      cards.appendChild(el('div', { class: 'contact-card' }, [
        el('span', { class: 'contact-label' }, ['Phone']),
        el('a', { href: `tel:${phoneLink}` }, [contact.phone])
      ]));
    } else {
      // TODO: Add phone number when available in data/content.json.
    }

    if (contact?.email) {
      cards.appendChild(el('div', { class: 'contact-card' }, [
        el('span', { class: 'contact-label' }, ['Email']),
        el('a', { href: `mailto:${contact.email}` }, [contact.email])
      ]));
    }

    if (contact?.address) {
      cards.appendChild(el('div', { class: 'contact-card' }, [
        el('span', { class: 'contact-label' }, ['Address']),
        el('span', {}, [contact.address])
      ]));
    } else {
      // TODO: Add address when available in data/content.json.
    }

    const form = el('form', { class: 'contact-form' });
    form.innerHTML = `
      <label>
        Name
        <input type="text" name="name" required />
      </label>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Subject
        <input type="text" name="subject" />
      </label>
      <label>
        Message
        <textarea name="message" rows="4" required></textarea>
      </label>
      <button type="submit">Message us</button>
    `;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');
      const subjectLine = subject ? `Golden Choice Inquiry: ${subject}` : 'Golden Choice Inquiry';
      const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });

    wrapper.appendChild(cards);
    wrapper.appendChild(form);
    return wrapper;
  }

  async function main(){
    try{
      const contentUrl = new URL('data/content.json', window.location.href);
      const sectionsUrl = new URL('data/sections.json', window.location.href);
      const [contentRes, sectionsRes] = await Promise.all([
        fetch(contentUrl, { cache: 'no-store' }),
        fetch(sectionsUrl, { cache: 'no-store' })
      ]);
      if (!contentRes.ok) throw new Error(`Failed to load content.json (${contentRes.status})`);
      if (!sectionsRes.ok) throw new Error(`Failed to load sections.json (${sectionsRes.status})`);
      const content = await contentRes.json();
      const sectionsData = await sectionsRes.json();

      const certificates = content.certificates || [];
      const logos = content.logos || [];
      const heroImage = content.heroImage;
      const services = content.services || [];
      const contact = content.contact || {};
      const lightbox = createLightbox(certificates);
      const sections = sectionsData.sections || [];

      if (brandLogo && content.brand?.logo) {
        brandLogo.src = content.brand.logo;
      }

      app.innerHTML = '';

      sections.forEach(section => {
        const container = el('section', { class: 'section', id: section.id });
        const inner = el('div', { class: 'section-inner' });

        if (section.title) {
          inner.appendChild(el('h2', { class: 'section-heading reveal' }, [section.title]));
        }

        if (section.id === 'home') {
          inner.appendChild(renderHero({ ...section, heroImage }));
          if (logos.length) {
            inner.appendChild(renderLogoStrip(logos));
          }
        } else if (section.id === 'about') {
          inner.appendChild(renderAbout(section));
        } else if (section.id === 'leadership') {
          inner.appendChild(renderLeadership(section));
        } else if (section.id === 'services') {
          inner.appendChild(renderServices(section, services));
        } else if (section.id === 'certificates') {
          inner.appendChild(renderCertificateGallery(certificates, lightbox));
        } else if (section.id === 'contact') {
          inner.appendChild(renderContactSection(contact));
        }

        container.appendChild(inner);
        app.appendChild(container);
      });

      buildNav(sections);
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
