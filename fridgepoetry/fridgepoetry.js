// fridgepoetry.js
const API = '/api/session';
let tilesById = {};  // { id: {id,type,text} }
let placement = {};  // tileId -> {container: 'bank' or 'slot:line_i_j'}
const LINES = 8;
const SLOTS_PER_LINE = 12; // adjust to allow layout; total slots 96

document.addEventListener('DOMContentLoaded', () => {
  initPoemArea();
  loadSession();
  document.getElementById('shuffleBtn').addEventListener('click', loadSession);
  document.getElementById('exportTxt').addEventListener('click', exportPoemText);
  document.getElementById('clearPoem').addEventListener('click', clearPoem);
});

function initPoemArea(){
  const poemArea = document.getElementById('poemArea');
  poemArea.innerHTML = '';
  for(let i=0;i<LINES;i++){
    const line = document.createElement('div');
    line.className = 'line';
    line.dataset.lineIndex = i;
    for(let j=0;j<SLOTS_PER_LINE;j++){
      const slot = document.createElement('div');
      slot.className = 'slot empty';
      slot.dataset.slot = `line_${i}_slot_${j}`;
      slot.addEventListener('dragover', onSlotDragOver);
      slot.addEventListener('drop', onSlotDrop);
      slot.addEventListener('dragenter', (e)=> slot.classList.add('highlight'));
      slot.addEventListener('dragleave', (e)=> slot.classList.remove('highlight'));
      line.appendChild(slot);
    }
    poemArea.appendChild(line);
  }
}

async function loadSession(){
  const meta = document.getElementById('meta');
  meta.textContent = 'Loading...';
  const res = await fetch(API);
  if(!res.ok){
    meta.textContent = 'Failed to load tiles';
    return;
  }
  const data = await res.json();
  meta.textContent = `Tiles for ${data.date}`;
  tilesById = {};
  placement = {};
  // render word bank
  const bank = document.getElementById('wordBank');
  bank.innerHTML = '';
  data.tiles.forEach(tile=>{
    tilesById[tile.id] = tile;
    placement[tile.id] = {container: 'bank'};
    const el = makeTileElement(tile);
    bank.appendChild(el);
  });
  // ensure poem area is cleared
  clearPoemSlots();
}

function makeTileElement(tile){
  const el = document.createElement('div');
  el.className = 'tile ' + tile.type;
  el.draggable = true;
  el.id = tile.id;
  el.textContent = tile.text;
  el.addEventListener('dragstart', onTileDragStart);
  el.addEventListener('dragend', onTileDragEnd);
  return el;
}

function onTileDragStart(e){
  e.dataTransfer.setData('text/plain', e.target.id);
  e.target.classList.add('dragging');
  // allow move
  e.dataTransfer.effectAllowed = 'move';
}

function onTileDragEnd(e){
  e.target.classList.remove('dragging');
}

function onSlotDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onSlotDrop(e){
  e.preventDefault();
  e.currentTarget.classList.remove('highlight');
  const tileId = e.dataTransfer.getData('text/plain');
  if(!tileId || !tilesById[tileId]) return;
  const targetSlot = e.currentTarget;
  const targetSlotKey = targetSlot.dataset.slot;
  const occupyingTile = targetSlot.querySelector('.tile');

  // Source container element
  const sourceInfo = placement[tileId];
  // If dropping into same slot, do nothing
  if(sourceInfo && sourceInfo.container === `slot:${targetSlotKey}`) return;

  // If slot occupied -> swap: move occupying tile back to source container (bank or source slot)
  if(occupyingTile){
    const otherTileId = occupyingTile.id;
    // move occupying tile to source container (bank or previous slot)
    if(sourceInfo.container === 'bank'){
      // put occupying tile into bank
      moveTileToBank(occupyingTile.id);
    }else if(sourceInfo.container && sourceInfo.container.startsWith('slot:')){
      // put occupying tile into source slot
      moveTileToSlot(otherTileId, sourceInfo.container.split(':')[1]);
    }else{
      // default to bank
      moveTileToBank(otherTileId);
    }
  }

  // Finally, move dragged tile into target slot
  moveTileToSlot(tileId, targetSlotKey);
}

function moveTileToBank(tileId){
  const bank = document.getElementById('wordBank');
  const tileEl = document.getElementById(tileId);
  if(!tileEl) {
    // recreate from tilesById if missing
    const tile = tilesById[tileId];
    if(tile){
      const el = makeTileElement(tile);
      bank.appendChild(el);
    }
  } else {
    bank.appendChild(tileEl);
  }
  placement[tileId] = {container:'bank'};
  refreshSlotVisuals();
}

function moveTileToSlot(tileId, slotKey){
  const slotEl = document.querySelector(`.slot[data-slot="${slotKey}"]`);
  if(!slotEl) return;
  // remove tile from previous container if there
  const tileEl = document.getElementById(tileId) || makeTileElement(tilesById[tileId]);
  slotEl.innerHTML = '';
  slotEl.classList.remove('empty');
  slotEl.classList.add('occupied');
  slotEl.appendChild(tileEl);
  placement[tileId] = {container: `slot:${slotKey}`};
  refreshSlotVisuals();
}

function refreshSlotVisuals(){
  // mark empty slots, and ensure tiles in bank only in bank
  document.querySelectorAll('.slot').forEach(s=>{
    if(s.querySelector('.tile')){
      s.classList.remove('empty'); s.classList.add('occupied');
    } else {
      s.classList.remove('occupied'); s.classList.add('empty');
    }
  });
}

function exportPoemText(){
  // Build poem by lines, joining tile texts with spaces, ignoring empty slots
  const lines = [];
  for(let i=0;i<LINES;i++){
    const parts = [];
    for(let j=0;j<SLOTS_PER_LINE;j++){
      const key = `line_${i}_slot_${j}`;
      const slot = document.querySelector(`.slot[data-slot="line_${i}_slot_${j}"]`);
      const tile = slot && slot.querySelector('.tile');
      if(tile) parts.push(tile.textContent.trim());
    }
    lines.push(parts.join(' '));
  }
  const poem = lines.filter(l=>l.trim().length>0).join('\n');
  document.getElementById('exportOut').value = poem;
}

function clearPoem(){
  // move all tiles back to bank
  Object.keys(placement).forEach(tid=>{
    placement[tid] = {container:'bank'};
    const el = document.getElementById(tid);
    if(el) document.getElementById('wordBank').appendChild(el);
  });
  clearPoemSlots();
}

function clearPoemSlots(){
  document.querySelectorAll('.slot').forEach(s=>{
    s.innerHTML = '';
    s.classList.remove('occupied'); s.classList.add('empty');
  });
}
