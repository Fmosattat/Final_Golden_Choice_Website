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

  function sectionPanel(children){
    return el('div', { class: 'section-panel' }, children);
  }

  function renderServices(services){
    const wrapper = el('div', { class: 'services' });
    wrapper.appendChild(el('h3', { class: 'panel-title' }, ['Services']));

    const list = el('div', { class: 'services-list' });
    (services || []).forEach((service, index) => {
      const buttonId = `service-btn-${index + 1}`;
      const panelId = `service-panel-${index + 1}`;
      const item = el('div', { class: 'service-item' });
      const trigger = el('button', {
        class: 'service-trigger',
        type: 'button',
        id: buttonId,
        'aria-expanded': 'false',
        'aria-controls': panelId
      }, [service.title || 'Service']);
      const panel = el('div', {
        class: 'service-panel',
        id: panelId,
        role: 'region',
        'aria-labelledby': buttonId,
        'data-open': 'false'
      }, [el('p', {}, [service.description || ''])]);
      panel.hidden = true;

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.dataset.open = String(!isOpen);
        if (!isOpen) {
          panel.hidden = false;
          requestAnimationFrame(() => {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
            panel.style.opacity = '1';
          });
        } else {
          panel.style.maxHeight = '0px';
          panel.style.opacity = '0';
          panel.addEventListener('transitionend', () => {
            if (panel.dataset.open === 'false') panel.hidden = true;
          }, { once: true });
        }
      });

      item.appendChild(trigger);
      item.appendChild(panel);
      list.appendChild(item);
    });

    wrapper.appendChild(list);
    return wrapper;
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

    return { modal, open };
  }

  function renderCertificateGallery(items, lightbox){
    const wrapper = el('div', { class: 'certificates' });
    wrapper.appendChild(el('h3', { class: 'panel-title' }, ['Certificates']));

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

  function renderAwardGallery(items){
    const wrapper = el('div', { class: 'award' });
    wrapper.appendChild(el('h3', { class: 'panel-title' }, ['Award Function 2023']));
    const grid = el('div', { class: 'award-grid' });
    (items || []).forEach((item, index) => {
      const card = el('div', { class: 'award-card' });
      const img = el('img', { src: item.src, alt: item.alt || `Award Function 2023 photo ${index + 1}`, loading: 'lazy' });
      card.appendChild(img);
      grid.appendChild(card);
    });
    wrapper.appendChild(grid);
    return wrapper;
  }

  function renderContactSection(contact){
    const wrapper = el('div', { class: 'contact' });
    wrapper.appendChild(el('h3', { class: 'panel-title' }, ['Contact Us']));
    const grid = el('div', { class: 'contact-grid' });
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

    grid.appendChild(cards);
    grid.appendChild(form);
    wrapper.appendChild(grid);
    return wrapper;
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
      const certificates = data.certificates || [];
      const awardPhotos = data.awardPhotos || [];
      const services = data.services || [];
      const contact = data.contact || {};
      const lightbox = createLightbox(certificates);

      // Build pages
      app.innerHTML = '';
      data.pages.forEach((p) => {
        const section = el('section', { class: 'section reveal', id: p.id });
        const titleRow = el('div', { class: 'section-title' }, [
          el('h2', {}, [p.title || p.id]),
        ]);

        section.appendChild(titleRow);

        if (p.template === 'certificates') {
          section.appendChild(sectionPanel([renderCertificateGallery(certificates, lightbox)]));
        } else if (p.template === 'award') {
          section.appendChild(sectionPanel([renderAwardGallery(awardPhotos)]));
        } else if (p.template === 'contact') {
          section.appendChild(sectionPanel([renderContactSection(contact)]));
        } else {
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

          section.appendChild(page);

          if (p.services) {
            section.appendChild(sectionPanel([renderServices(services)]));
          }

          const cap = el('div', { class: 'caption' }, [p.caption || '']);
          section.appendChild(cap);
        }
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
