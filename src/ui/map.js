/** Render scenario locations without owning any movement rules. Missing coordinates use a list. */
export function renderMap(anchor, locations, map, state, busy, onMove, threats=[], portrait=null) {
  const mapped = Boolean(map?.image) && locations.every(l => {
    const p = map.points?.[l.id];
    return p && [p.x,p.y].every(n => Number.isFinite(n) && n >= 0 && n <= 100);
  });
  anchor.classList.toggle('mapped', mapped);
  anchor.style.backgroundImage = mapped ? `url("${map.image}")` : '';
  anchor.style.setProperty('--map-art', mapped ? `url("${new URL(map.image, document.baseURI).href}")` : 'none');
  const controls=locations.map(location => {
    const current = location.id === state.locationId;
    const locked = !state.unlockedLocations.includes(location.id);
    const b = document.createElement('button');
    b.textContent = `${current ? '◉' : locked ? '▣' : '◇'} ${location.name}${current ? ' · zde' : locked ? ' · zamčeno' : ''}`;
    b.className = `map-point${current ? ' active' : ''}${locked ? ' locked' : ''}`;
    b.dataset.locationId = location.id;
    const threat=threats.find(e=>e.locationId===location.id&&e.status==='pending');
    if(threat){
      b.classList.add('threatened');b.setAttribute('aria-describedby','mapThreat');b.title=threat.text;
      const mark=document.createElement('span');mark.textContent=' ⚠';mark.setAttribute('aria-hidden','true');b.append(mark);
    }
    if(current) b.setAttribute('aria-current','location');
    b.disabled = busy || state.ended || state.ap < 1 || current || locked;
    if(mapped) { b.style.left = `${map.points[location.id].x}%`; b.style.top = `${map.points[location.id].y}%`; }
    b.onclick = () => onMove(location.id);
    return b;
  });
  if(mapped){
    const layer=document.createElement('div');layer.className='map-connections';layer.setAttribute('aria-hidden','true');
    const from=map.points[state.locationId];
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','none');
    if(from&&!state.ended)for(const location of locations){
      if(location.id===state.locationId||!state.unlockedLocations.includes(location.id))continue;
      const to=map.points[location.id],line=document.createElementNS(svg.namespaceURI,'line');
      for(const [key,value] of Object.entries({x1:from.x,y1:from.y,x2:to.x,y2:to.y}))line.setAttribute(key,value);
      line.setAttribute('vector-effect','non-scaling-stroke');svg.append(line);
    }
    layer.append(svg);
    if(from&&portrait){
      const token=document.createElement('img');token.className='map-investigator-token';token.src=portrait;token.alt='';
      token.style.left=from.x+'%';token.style.top=from.y+'%';layer.append(token);
    }
    controls.unshift(layer);
  }
  anchor.replaceChildren(...controls);
}
