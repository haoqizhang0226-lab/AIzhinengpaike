(() => {
  const active = new WeakMap();
  const successTimers = new WeakMap();

  function cancelSuccessClose(host) {
    clearTimeout(successTimers.get(host));
    successTimers.delete(host);
  }

  function closeAfterSuccess(host, close) {
    cancelSuccessClose(host);
    successTimers.set(host, setTimeout(() => {
      successTimers.delete(host);
      if (!host.hidden) close();
    }, 1050));
  }

  function stop(host, fade = true) {
    const state = active.get(host);
    if (!state) return;
    const {layer, surface, reusable, reading} = state;
    for (const [element, wasInert] of surface) element.inert = wasInert;
    reading.forEach(element => {
      element.classList.remove('analysis-motion-reading');
      element.style.removeProperty('--analysis-motion-order');
    });
    const remove = () => {
      if (active.get(host)?.layer === layer) return;
      if (reusable) layer.hidden = true;
      else layer.remove();
    };
    active.delete(host);
    if (fade && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      layer.classList.add('is-leaving');
      layer.setAttribute('aria-hidden', 'true');
      layer.inert = true;
      setTimeout(remove, 240);
    } else remove();
  }

  function start(host, {title, description, header, surface = [], layer} = {}) {
    stop(host, false);
    if (getComputedStyle(host).position === 'static') host.classList.add('analysis-motion-anchor');
    const reusable = Boolean(layer);
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'analysis-motion-layer';
      layer.innerHTML = '<div class="analysis-motion-wave" aria-hidden="true"></div><div class="analysis-motion-status" role="status" aria-live="polite"><span class="analysis-motion-spinner" aria-hidden="true"></span><strong></strong><p></p></div>';
      host.append(layer);
      layer.querySelector('strong').textContent = title;
      const detail = layer.querySelector('p');
      detail.textContent = description || '';
      detail.hidden = !description;
    }
    if (header) layer.style.setProperty('--analysis-motion-top', `${header.getBoundingClientRect().bottom - host.getBoundingClientRect().top}px`);
    const blocked = surface.map(element => [element, element.inert]);
    blocked.forEach(([element]) => { element.inert = true; });
    const reading = surface.flatMap(element => [...element.querySelectorAll(
      '.ai-precheck-readonly-card, .supplement-panel, .content-card, .smart-consult-edit, .self-class-ai-columns > section, .wecom-review > section'
    )]).slice(0, 5);
    reading.forEach((element, index) => {
      element.style.setProperty('--analysis-motion-order', index);
      element.classList.add('analysis-motion-reading');
    });
    layer.classList.remove('is-leaving');
    layer.removeAttribute('aria-hidden');
    layer.inert = false;
    layer.hidden = false;
    active.set(host, {layer, surface: blocked, reusable, reading});
  }

  function reveal(root, selector) {
    [...root.querySelectorAll(selector)].slice(0, 6).forEach((element, index) => {
      element.style.setProperty('--analysis-motion-order', index);
      element.classList.add('analysis-motion-revealed');
      setTimeout(() => {
        element.classList.remove('analysis-motion-revealed');
        element.style.removeProperty('--analysis-motion-order');
      }, 960);
    });
  }

  window.analysisMotion = {start, stop, reveal, closeAfterSuccess, cancelSuccessClose};
})();
