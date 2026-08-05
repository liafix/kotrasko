const styles = [
  { id:'clean-fade', title:'Clean & Classic', tag:'LOW FADE', note:'Čisté línie a prirodzený prechod.', image:'/portfolio/01-clean-fade.webp' },
  { id:'textured-modern', title:'Textured & Modern', tag:'TEXTURED', note:'Objem, textúra a moderný finish.', image:'/portfolio/02-textured-modern.webp' },
  { id:'clean-classic', title:'Sharp & Classic', tag:'CLASSIC', note:'Presný, nadčasový a ľahko udržateľný.', image:'/portfolio/03-clean-classic.webp' },
  { id:'low-fade', title:'Low Fade', tag:'LOW FADE', note:'Jemný prechod, ktorý drží tvar.', image:'/portfolio/04-low-fade.webp' },
  { id:'taper-volume', title:'Taper & Volume', tag:'TAPER', note:'Čistý krk a prirodzený objem hore.', image:'/portfolio/05-taper-volume.webp' },
  { id:'messy-natural', title:'Messy & Natural', tag:'NATURAL', note:'Uvoľnený look s kontrolovanou textúrou.', image:'/portfolio/06-messy-natural.webp' },
  { id:'sharp-taper', title:'Sharp Taper', tag:'SHARP', note:'Výrazný detail a ostrý prechod.', image:'/portfolio/07-sharp-taper.webp' },
  { id:'barber-choice', title:'Nechám to na Kotraska', tag:'BARBER CHOICE', note:'Kotrasko odporučí look podľa tvojich vlasov.', image:'/portfolio/02-textured-modern.webp' }
];

const state = {
  config: { serviceName:'Pánsky strih', priceCents:1000, currency:'EUR', durationMinutes:60, demoMode:true, shopName:'Big Head House Barbershop', location:'Ilava', phone:'', instagram:'https://instagram.com/kotrasko' },
  availability: [], step:0, style:styles[0], day:null, slot:null,
  details:{ customerName:'', customerEmail:'', customerPhone:'+421 ', customerNote:'', consent:false },
  errors:{}, hold:null, success:null, manageToken:null
};

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const overlay = $('#bookingOverlay');
const screen = $('#bookingScreen');
const progress = $('#bookingProgress');
const art = $('#bookingArt');

function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function euro(cents=1000){ return new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR',minimumFractionDigits:0}).format(cents/100); }
function formatDate(iso, options={}){ return new Intl.DateTimeFormat('sk-SK',{ timeZone:'Europe/Bratislava', ...options }).format(new Date(iso)); }
function dayTitle(day){ return new Intl.DateTimeFormat('sk-SK',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Bratislava'}).format(new Date(`${day.date}T12:00:00`)); }
function statusLabel(status){ return ({PENDING_PAYMENT:'Čaká na platbu',CONFIRMED:'Potvrdená',COMPLETED:'Dokončená',CANCELLED_BY_CUSTOMER:'Zrušená',CANCELLED_BY_ADMIN:'Zrušená',NO_SHOW:'No-show',PAYMENT_EXCEPTION:'Kontrola platby',REFUNDED:'Vrátená'})[status] || status; }
function svgCheck(){ return '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>'; }
function svgArrow(){ return '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'; }

async function api(path, options={}){
  const response = await fetch(path,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  const data = await response.json().catch(()=>({}));
  if(!response.ok){ const err = new Error(data.error || 'REQUEST_FAILED'); err.data=data; throw err; }
  return data;
}

function toast(title, message=''){
  const item=document.createElement('div'); item.className='toast';
  item.innerHTML=`<strong>${escapeHtml(title)}</strong>${message?`<small>${escapeHtml(message)}</small>`:''}`;
  $('#toastStack').append(item); setTimeout(()=>item.remove(),4400);
}

function renderLookbook(){
  $('#lookbookRail').innerHTML=styles.slice(0,7).map(s=>`<button class="look-card" data-style-id="${s.id}" aria-label="Vybrať ${escapeHtml(s.title)}">
    <img src="${s.image}" alt="${escapeHtml(s.title)} — Kotraskova práca" width="960" height="1200" loading="lazy">
    <span class="look-card-content"><small>${escapeHtml(s.tag)}</small><strong>${escapeHtml(s.title)}</strong></span>
  </button>`).join('');
  $$('.look-card').forEach(card=>card.addEventListener('click',()=>openBooking(card.dataset.styleId)));
}

function setupReveal(){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target)}}),{threshold:.12});
  $$('.reveal').forEach(el=>observer.observe(el));
  setTimeout(()=>$$('.reveal').forEach(el=>el.classList.add('is-visible')),2200);
  addEventListener('scroll',()=>$('#siteHeader').classList.toggle('scrolled',scrollY>20),{passive:true});
}

async function loadConfig(){
  try{ const data=await api('/api/config'); state.config={...state.config,...data}; }
  catch{ toast('Demo režim','Konfiguráciu sa nepodarilo načítať, používame lokálne hodnoty.'); }
}

async function loadAvailability(force=false){
  if(state.availability.length && !force) return;
  try{
    const data=await api('/api/availability'); state.availability=data.days || [];
    const first=state.availability.find(d=>d.slots?.length);
    if(first){ state.day=first; state.slot=first.slots[0]; }
    renderHomepageAvailability();
  }catch{ toast('Dostupnosť nie je online','Spusti lokálny server alebo nastav databázu.'); }
}

function renderHomepageAvailability(){
  const days=state.availability.filter(d=>d.slots.length).slice(0,5);
  $('#miniCalendar').innerHTML=days.map((d,i)=>`<div class="mini-day ${i===0?'active':''}"><small>${escapeHtml(d.weekday)}</small><strong>${new Date(`${d.date}T12:00:00`).getDate()}</strong></div>`).join('') || '<span>Termíny sa načítavajú…</span>';
  const first=days[0]?.slots?.[0];
  if(first) $('#nextSlotHeadline').textContent=`${formatDate(first.startsAt,{weekday:'long',day:'numeric',month:'long'})} o ${formatDate(first.startsAt,{hour:'2-digit',minute:'2-digit'})}`;
}

function openBooking(styleId){
  if(styleId) state.style=styles.find(s=>s.id===styleId)||styles[0];
  state.step=0; state.hold=null; state.success=null; state.errors={};
  art.src=state.style.image;
  overlay.hidden=false; document.body.classList.add('modal-open');
  requestAnimationFrame(()=>$('.booking-close').focus());
  renderBooking(); loadAvailability().then(()=>{ if(state.step===1) renderBooking(); });
}
function closeBooking(){ overlay.hidden=true; document.body.classList.remove('modal-open'); }

function renderProgress(){
  const labels=['Vibe','Termín','Detaily','Platba'];
  progress.innerHTML=labels.map((label,i)=>`${i?'<span class="progress-line"></span>':''}<span class="progress-step ${i===state.step?'active':i<state.step?'done':''}"><span class="progress-dot">${i<state.step?'✓':i+1}</span><span>${label}</span></span>`).join('');
}

function renderBooking(){
  renderProgress(); art.src=state.style.image;
  if(state.success) return renderSuccess(state.success);
  if(state.step===0) renderVibes();
  if(state.step===1) renderTime();
  if(state.step===2) renderDetails();
  if(state.step===3) renderReview();
}

function renderVibes(){
  screen.innerHTML=`<h2 class="booking-title" id="bookingTitle">Vyber svoju haircut.</h2><p class="booking-subtitle">Fotografia sa pripojí k rezervácii ako referencia. Cena aj dĺžka zostávajú rovnaké.</p>
    <div class="booking-grid">${styles.slice(0,6).map(s=>`<button class="vibe-option ${state.style.id===s.id?'selected':''}" data-vibe="${s.id}"><img src="${s.image}" alt="${escapeHtml(s.title)}"><span class="vibe-copy"><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.note)}</small></span><span class="select-check">${svgCheck()}</span></button>`).join('')}</div>
    <div class="booking-footer"><span></span><button class="btn btn-gold btn-lg" id="nextToTime">Pokračovať ${svgArrow()}</button></div>`;
  $$('[data-vibe]',screen).forEach(btn=>btn.addEventListener('click',()=>{state.style=styles.find(s=>s.id===btn.dataset.vibe);art.src=state.style.image;renderVibes()}));
  $('#nextToTime').onclick=async()=>{state.step=1;await loadAvailability();renderBooking()};
}

function renderTime(){
  const days=state.availability;
  if(!days.length){ screen.innerHTML='<h2 class="booking-title">Hľadáme termíny…</h2><p class="booking-subtitle">Dostupnosť sa práve načítava.</p>'; return; }
  if(!state.day) state.day=days.find(d=>d.slots.length)||days[0];
  if(state.day && !state.slot) state.slot=state.day.slots[0]||null;
  screen.innerHTML=`<h2 class="booking-title" id="bookingTitle">Vyber dátum a čas.</h2><p class="booking-subtitle">Zobrazené sú voľné 60-minútové sloty v nasledujúcich 30 dňoch.</p>
    <div class="date-strip">${days.map(d=>`<button class="date-option ${state.day?.date===d.date?'selected':''}" data-date="${d.date}" ${d.slots.length?'':'disabled'}><small>${escapeHtml(d.weekday)}</small><strong>${new Date(`${d.date}T12:00:00`).getDate()}</strong></button>`).join('')}</div>
    <div class="slot-heading"><strong>${state.day?escapeHtml(dayTitle(state.day)):'Vyber deň'}</strong><small>${state.day?.slots.length||0} voľných termínov</small></div>
    <div class="slot-grid">${state.day?.slots.length?state.day.slots.map(s=>`<button class="slot-button ${state.slot?.startsAt===s.startsAt?'selected':''}" data-slot="${s.startsAt}">${escapeHtml(s.label)}</button>`).join(''):'<div class="empty-slots">V tento deň nie sú voľné termíny.</div>'}</div>
    <div class="booking-footer"><button class="back-button" id="backToVibe">← Späť</button><button class="btn btn-gold btn-lg" id="nextToDetails" ${state.slot?'':'disabled'}>Pokračovať ${svgArrow()}</button></div>`;
  $$('[data-date]',screen).forEach(btn=>btn.addEventListener('click',()=>{state.day=days.find(d=>d.date===btn.dataset.date);state.slot=state.day.slots[0]||null;renderTime()}));
  $$('[data-slot]',screen).forEach(btn=>btn.addEventListener('click',()=>{state.slot=state.day.slots.find(s=>s.startsAt===btn.dataset.slot);renderTime()}));
  $('#backToVibe').onclick=()=>{state.step=0;renderBooking()};
  $('#nextToDetails').onclick=()=>{if(!state.slot)return;state.step=2;renderBooking()};
}

function renderDetails(){
  const d=state.details,e=state.errors;
  screen.innerHTML=`<h2 class="booking-title" id="bookingTitle">Kto príde?</h2><p class="booking-subtitle">Potrebujeme iba údaje na potvrdenie a správu rezervácie.</p>
    <form id="detailsForm" novalidate><div class="form-grid">
      <div class="field full"><label for="customerName">Meno a priezvisko</label><input id="customerName" name="customerName" autocomplete="name" value="${escapeHtml(d.customerName)}" placeholder="Dušan Cabala"><span class="field-error">${escapeHtml(e.customerName||'')}</span></div>
      <div class="field"><label for="customerEmail">E-mail</label><input id="customerEmail" name="customerEmail" type="email" autocomplete="email" value="${escapeHtml(d.customerEmail)}" placeholder="meno@email.sk"><span class="field-error">${escapeHtml(e.customerEmail||'')}</span></div>
      <div class="field"><label for="customerPhone">Telefón</label><input id="customerPhone" name="customerPhone" type="tel" autocomplete="tel" value="${escapeHtml(d.customerPhone)}" placeholder="+421 900 000 000"><span class="field-error">${escapeHtml(e.customerPhone||'')}</span></div>
      <div class="field full"><label for="customerNote">Čo má Kotrasko vedieť? <span style="color:var(--dim)">(voliteľné)</span></label><textarea id="customerNote" name="customerNote" maxlength="500" placeholder="Napríklad: chcem zachovať dĺžku hore…">${escapeHtml(d.customerNote)}</textarea></div>
    </div><label class="consent"><input id="consent" type="checkbox" ${d.consent?'checked':''}><span>Súhlasím so spracovaním údajov na vybavenie rezervácie a s podmienkami rezervácie.</span></label><span class="field-error">${escapeHtml(e.consent||'')}</span>
    <div class="booking-footer"><button type="button" class="back-button" id="backToTime">← Späť</button><button class="btn btn-gold btn-lg" type="submit">Skontrolovať rezerváciu ${svgArrow()}</button></div></form>`;
  $('#backToTime').onclick=()=>{readDetails();state.step=1;renderBooking()};
  $('#detailsForm').onsubmit=eve=>{eve.preventDefault();readDetails(); if(validateDetails()){state.step=3;renderBooking()}else renderDetails()};
}
function readDetails(){
  const form=$('#detailsForm'); if(!form)return;
  state.details={customerName:form.customerName.value.trim(),customerEmail:form.customerEmail.value.trim(),customerPhone:form.customerPhone.value.trim(),customerNote:form.customerNote.value.trim(),consent:form.querySelector('#consent').checked};
}
function validateDetails(){
  const e={}; if(state.details.customerName.length<2)e.customerName='Zadaj meno a priezvisko.';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.details.customerEmail))e.customerEmail='Zadaj platný e-mail.';
  if(state.details.customerPhone.replace(/\D/g,'').length<9)e.customerPhone='Zadaj platné telefónne číslo.';
  if(!state.details.consent)e.consent='Súhlas je potrebný na vytvorenie rezervácie.';
  state.errors=e;return !Object.keys(e).length;
}

function renderReview(){
  const dateLabel=state.slot?`${formatDate(state.slot.startsAt,{weekday:'long',day:'numeric',month:'long'})} · ${formatDate(state.slot.startsAt,{hour:'2-digit',minute:'2-digit'})}`:'—';
  const payment=state.hold?`<div class="payment-ready"><h3>Termín držíme 15 minút.</h3><p>Rezervácia <strong>${escapeHtml(state.hold.booking.publicId)}</strong> čaká na testovaciu platbu 10 €.</p><div class="payment-actions"><a class="btn btn-gold btn-lg" id="stripeLink" href="${escapeHtml(state.hold.paymentUrl)}">Zaplatiť cez Stripe ${svgArrow()}</a>${state.config.demoMode?'<button class="btn btn-outline" id="demoConfirm">Lokálny test bez platby</button>':''}</div></div>`:'';
  screen.innerHTML=`<h2 class="booking-title" id="bookingTitle">Tvoj booking ticket.</h2><p class="booking-subtitle">Skontroluj detaily. Po vytvorení hold-u ťa presmerujeme na bezpečný Stripe Checkout.</p>
    <div class="review-card"><img src="${state.style.image}" alt="${escapeHtml(state.style.title)}"><div class="review-details"><h3>${escapeHtml(state.config.serviceName)}</h3>
      <div class="review-line"><span>Vibe</span><strong>${escapeHtml(state.style.title)}</strong></div><div class="review-line"><span>Termín</span><strong>${escapeHtml(dateLabel)}</strong></div><div class="review-line"><span>Miesto</span><strong>${escapeHtml(state.config.shopName)}, ${escapeHtml(state.config.location)}</strong></div><div class="review-line"><span>Klient</span><strong>${escapeHtml(state.details.customerName)}</strong></div><div class="review-line"><span>Cena</span><strong>${euro(state.config.priceCents)}</strong></div></div></div>
    <p class="hold-note">Termín ti podržíme 15 minút počas platby. Rezervácia sa definitívne potvrdí až po úspešnej platbe.</p>${payment}
    <div class="booking-footer"><button class="back-button" id="backToDetails">← Upraviť údaje</button>${state.hold?'':`<button class="btn btn-gold btn-lg" id="createHold">Pokračovať na platbu ${svgArrow()}</button>`}</div>`;
  $('#backToDetails').onclick=()=>{state.hold=null;state.step=2;renderBooking()};
  if($('#createHold')) $('#createHold').onclick=createHold;
  if($('#stripeLink')) $('#stripeLink').onclick=()=>{sessionStorage.setItem('kotrasko_pending_booking',state.hold.booking.publicId);sessionStorage.setItem('kotrasko_manage_token',state.hold.manageToken||'')};
  if($('#demoConfirm')) $('#demoConfirm').onclick=demoConfirm;
}

async function createHold(){
  const button=$('#createHold');button.disabled=true;button.textContent='Držíme termín…';
  try{
    const data=await api('/api/bookings/hold',{method:'POST',body:JSON.stringify({
      customerName:state.details.customerName,customerEmail:state.details.customerEmail,customerPhone:state.details.customerPhone,customerNote:state.details.customerNote,
      styleId:state.style.id,styleTitle:state.style.title,startsAt:state.slot.startsAt,endsAt:state.slot.endsAt
    })});
    state.hold=data;state.manageToken=data.manageToken;sessionStorage.setItem('kotrasko_manage_token',data.manageToken||'');renderReview();toast('Termín je dočasne rezervovaný','Dokonči platbu do 15 minút.');
  }catch(error){
    if(error.message==='SLOT_TAKEN'){toast('Termín už nie je voľný','Vyber si, prosím, iný čas.');await loadAvailability(true);state.step=1;state.slot=null;renderBooking()}
    else if(error.message==='VALIDATION_ERROR'){toast('Skontroluj údaje','Niektoré údaje nie sú platné.');state.errors=error.data.fields||{};state.step=2;renderBooking()}
    else toast('Rezerváciu sa nepodarilo vytvoriť','Skús to znova o chvíľu.');
  }
}
async function demoConfirm(){
  const btn=$('#demoConfirm');btn.disabled=true;btn.textContent='Potvrdzujeme…';
  try{const data=await api('/api/demo/confirm',{method:'POST',body:JSON.stringify({publicId:state.hold.booking.publicId})});state.manageToken=data.manageToken;sessionStorage.setItem('kotrasko_manage_token',data.manageToken||'');state.success=data.booking;renderBooking();await loadAvailability(true)}
  catch{toast('Demo potvrdenie zlyhalo','Skontroluj, či je DEMO_MODE zapnutý.');btn.disabled=false;btn.textContent='Lokálny test bez platby'}
}

function googleCalendarUrl(booking){
  const stamp=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const params=new URLSearchParams({action:'TEMPLATE',text:'Pánsky strih — KOTRASKO',dates:`${stamp(booking.startsAt)}/${stamp(booking.endsAt)}`,location:`${state.config.shopName}, ${state.config.location}`,details:'Rezervácia strihu u Kotraska.'});
  return `https://calendar.google.com/calendar/render?${params}`;
}
function renderSuccess(booking){
  progress.innerHTML='';
  const confirmed=booking.status==='CONFIRMED';
  screen.innerHTML=`<div class="success-view"><div class="success-ring">${confirmed?svgCheck():'<svg viewBox="0 0 24 24"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/></svg>'}</div><h2 id="bookingTitle">${confirmed?"YOU’RE BOOKED.":'PAYMENT PENDING.'}</h2><p>${confirmed?'Tvoj termín je potvrdený. Kotrasko sa na teba teší.':'Čakáme na potvrdenie platby zo Stripe.'}</p>
    <div class="success-card"><div class="review-line"><span>Služba</span><strong>${escapeHtml(booking.serviceName||state.config.serviceName)} · ${euro(state.config.priceCents)}</strong></div><div class="review-line"><span>Termín</span><strong>${formatDate(booking.startsAt,{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}</strong></div><div class="review-line"><span>Miesto</span><strong>${escapeHtml(state.config.shopName)}, ${escapeHtml(state.config.location)}</strong></div><div class="review-line"><span>Stav</span><strong>${escapeHtml(statusLabel(booking.status))}</strong></div></div>
    <div class="success-actions"><a class="btn btn-gold" target="_blank" rel="noreferrer" href="${googleCalendarUrl(booking)}">Pridať do kalendára</a><a class="btn btn-outline" target="_blank" rel="noreferrer" href="https://maps.google.com/?q=Big+Head+House+Barbershop+Ilava">Otvoriť navigáciu</a><button class="btn btn-quiet" data-close-booking>Hotovo</button></div></div>`;
  $$('[data-close-booking]',screen).forEach(el=>el.onclick=closeBooking);
}

async function showSuccessFromUrl(){
  const params=new URLSearchParams(location.search);const id=params.get('success');const session=params.get('session_id');
  if(!id&&!session)return false;
  overlay.hidden=false;document.body.classList.add('modal-open');state.step=4;
  screen.innerHTML='<div class="success-view"><h2>Overujeme platbu…</h2></div>';
  try{
    let data;if(session)data=await api(`/api/stripe/session/${encodeURIComponent(session)}`);else data=await api(`/api/bookings/${encodeURIComponent(id)}`);
    state.success=data.booking;renderBooking();
  }catch{screen.innerHTML='<div class="success-view"><h2>Platbu sa nepodarilo overiť.</h2><p>Skontroluj e-mail alebo kontaktuj administrátora.</p></div>'}
  return true;
}

async function showManageFromUrl(){
  const token=new URLSearchParams(location.search).get('manage');if(!token)return false;
  overlay.hidden=false;document.body.classList.add('modal-open');progress.innerHTML='';
  try{const data=await api(`/api/manage/${encodeURIComponent(token)}`);renderManage(data.booking,token)}catch{screen.innerHTML='<div class="manage-card"><h2 class="booking-title">Odkaz nie je platný.</h2><p class="booking-subtitle">Odkaz mohol exspirovať alebo rezervácia neexistuje.</p></div>'}
  return true;
}
function renderManage(booking,token){
  screen.innerHTML=`<div class="manage-card"><p class="section-kicker">SPRÁVA REZERVÁCIE</p><h2 class="booking-title" id="bookingTitle">${escapeHtml(booking.serviceName)}</h2><p class="booking-subtitle">${formatDate(booking.startsAt,{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})} · ${escapeHtml(state.config.shopName)}</p>
    <div class="success-card"><div class="review-line"><span>Stav</span><strong>${escapeHtml(statusLabel(booking.status))}</strong></div><div class="review-line"><span>Vibe</span><strong>${escapeHtml(booking.styleTitle||'—')}</strong></div><div class="review-line"><span>Cena</span><strong>${euro(state.config.priceCents)}</strong></div></div>
    <div class="manage-warning"><strong>Chceš rezerváciu zrušiť?</strong><br>Najskôr telefonicky kontaktuj prevádzku a povedz dôvod. Potom môžeš termín uvoľniť cez web.</div>
    <div class="field" style="margin-top:18px"><label for="cancelReason">Dôvod zrušenia</label><textarea id="cancelReason" placeholder="Napíš krátky dôvod…"></textarea></div>
    <div class="success-actions" style="justify-content:flex-start;margin-top:18px">${state.config.phone?`<a class="btn btn-outline" href="tel:${escapeHtml(state.config.phone)}">Zavolať ${escapeHtml(state.config.phone)}</a>`:'<button class="btn btn-outline" disabled>Telefón bude doplnený</button>'}<button class="btn btn-quiet" id="cancelBooking">Už som kontaktoval prevádzku — zrušiť</button></div></div>`;
  $('#cancelBooking').onclick=async()=>{if(!confirm('Naozaj chceš zrušiť rezerváciu?'))return;try{const data=await api(`/api/bookings/${encodeURIComponent(booking.publicId)}/cancel`,{method:'POST',body:JSON.stringify({manageToken:token,reason:$('#cancelReason').value})});renderManage(data.booking,token);toast('Rezervácia bola zrušená','Termín je opäť voľný.')}catch{toast('Zrušenie sa nepodarilo','Kontaktuj administrátora.')}};
}

function bindGlobal(){
  $$('[data-open-booking]').forEach(el=>el.addEventListener('click',()=>openBooking()));
  $$('[data-close-booking]').forEach(el=>el.addEventListener('click',closeBooking));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeBooking()});
}

async function init(){
  renderLookbook();setupReveal();bindGlobal();await loadConfig();await loadAvailability();
  if(await showManageFromUrl())return;if(await showSuccessFromUrl())return;
  if('serviceWorker' in navigator && location.protocol==='https:') navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
init();
