/** Render scenario locations without owning any movement rules. Missing coordinates use a list. */
export function renderMap(anchor, locations, map, state, busy, onMove) {
  const mapped = Boolean(map?.image) && locations.every(l => {
    const p = map.points?.[l.id];
    return p && [p.x,p.y].every(n => Number.isFinite(n) && n >= 0 && n <= 100);
  });
  anchor.classList.toggle('mapped', mapped);
  anchor.style.backgroundImage = mapped ? `url("${map.image}")` : '';
  anchor.style.setProperty('--map-art', mapped ? `url("${new URL(map.image, document.baseURI).href}")` : 'none');
  anchor.replaceChildren(...locations.map(location => {
    const current = location.id === state.locationId;
    const locked = !state.unlockedLocations.includes(location.id);
    const b = document.createElement('button');
    b.textContent = `${current ? '◉' : locked ? '▣' : '◇'} ${location.name}${current ? ' · zde' : locked ? ' · zamčeno' : ''}`;
    b.className = `map-point${current ? ' active' : ''}${locked ? ' locked' : ''}`;
    b.dataset.locationId = location.id;
    if(current) b.setAttribute('aria-current','location');
    b.disabled = busy || state.ended || state.ap < 1 || current || locked;
    if(mapped) { b.style.left = `${map.points[location.id].x}%`; b.style.top = `${map.points[location.id].y}%`; }
    b.onclick = () => onMove(location.id);
    return b;
  }));
}
