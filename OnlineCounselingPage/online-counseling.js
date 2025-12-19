// BetterDays Online Counseling Scheduler (front-end demo)
// - Calendar + timeslots
// - Prevent double-booking per counselor + datetime
// - Saves bookings in localStorage
// - Exports .ICS calendar file

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const STORAGE_KEY = "betterdays_bookings_v1";

const state = {
  step: 1,
  counselor: "",
  type: "Video",
  duration: 30,
  selectedDate: null,  // Date object at local midnight
  selectedTime: "",    // "HH:MM"
  details: {
    fullName: "",
    pronouns: "",
    email: "",
    phone: "",
    notes: ""
  }
};

// Helpers
function pad2(n){ return String(n).padStart(2,"0"); }
function fmtDate(d){
  const opts = { weekday:"short", month:"short", day:"numeric", year:"numeric" };
  return d.toLocaleDateString(undefined, opts);
}
function fmtTime(hhmm){
  // hhmm "13:30"
  const [h,m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h,m,0,0);
  return d.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
}
function dateKey(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function bookingKey({ counselor, startISO }){
  return `${counselor}__${startISO}`;
}
function loadBookings(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }catch{ return []; }
}
function saveBookings(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function isBooked(counselor, startISO){
  const list = loadBookings();
  return list.some(b => b.counselor === counselor && b.startISO === startISO);
}
function combineStartISO(dateObj, hhmm){
  const [h,m] = hhmm.split(":").map(Number);
  const d = new Date(dateObj);
  d.setHours(h,m,0,0);
  return d.toISOString();
}
function addMinutesISO(startISO, minutes){
  const d = new Date(startISO);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function setTimezoneInput(){
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  $("#timezone").value = tz;
}

function setYear(){
  $("#year").textContent = new Date().getFullYear();
}

// Stepper navigation
function goStep(n){
  state.step = n;

  $$(".step").forEach(s => s.classList.toggle("active", Number(s.dataset.step) === n));
  $$(".panel").forEach(p => p.classList.toggle("active", Number(p.dataset.panel) === n));

  updateLivePreview();
  if(n === 2) renderCalendar();
  if(n === 4) renderSummary();
}

function bindStepperClicks(){
  $$(".step").forEach(stepEl => {
    stepEl.addEventListener("click", () => {
      const target = Number(stepEl.dataset.step);
      // Only allow clicking forward if requirements are met
      if(target === 1) return goStep(1);
      if(target === 2){
        if(!canGoStep2()) return flashHint("#hint1");
        return goStep(2);
      }
      if(target === 3){
        if(!canGoStep3()) return flashHint("#hint2");
        return goStep(3);
      }
      if(target === 4){
        if(!canGoStep4()) return flashHint("#hint3");
        return goStep(4);
      }
    });
  });
}

function flashHint(sel){
  const el = $(sel);
  if(!el) return;
  el.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(0)"}], {duration: 240});
}

// Requirements
function canGoStep2(){
  return !!state.counselor && !!state.type && !!state.duration;
}
function canGoStep3(){
  return canGoStep2() && !!state.selectedDate && !!state.selectedTime;
}
function canGoStep4(){
  const d = state.details;
  return canGoStep3()
    && d.fullName.trim().length >= 2
    && d.email.includes("@") && d.email.includes(".");
}

// Session type segmented
function bindSegmented(){
  $$(".seg").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".seg").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.type = btn.dataset.type;
      $("#sessionType").value = state.type;
      updateLivePreview();
      // times can change visually (optional). re-render if step 2.
      if(state.step === 2) renderTimes();
    });
  });
}

// Step 1 inputs
function bindStep1(){
  $("#counselor").addEventListener("change", (e) => {
    state.counselor = e.target.value;
    updateLivePreview();
    updateNextButtonStates();
    updateNextAvailable();
    if(state.step === 2) renderTimes();
  });

  $("#duration").addEventListener("change", (e) => {
    state.duration = Number(e.target.value);
    updateLivePreview();
    updateNextButtonStates();
    updateNextAvailable();
    if(state.step === 2) renderTimes();
  });

  $("#toStep2").addEventListener("click", () => {
    if(!canGoStep2()) return flashHint("#hint1");
    goStep(2);
  });
}

// Calendar + timeslots
let calMonth = new Date(); // current display month
calMonth.setDate(1);
calMonth.setHours(0,0,0,0);

function renderCalendar(){
  const grid = $("#calGrid");
  grid.innerHTML = "";

  const title = $("#calTitle");
  title.textContent = calMonth.toLocaleDateString(undefined, { month:"long", year:"numeric" });

  const dows = ["S","M","T","W","T","F","S"];
  dows.forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-dow";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(calMonth);
  const startDow = firstDay.getDay();

  // fill blanks
  for(let i=0;i<startDow;i++){
    const blank = document.createElement("div");
    blank.className = "cal-day disabled";
    blank.textContent = "";
    grid.appendChild(blank);
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  const month = calMonth.getMonth();
  const year = calMonth.getFullYear();

  const daysInMonth = new Date(year, month+1, 0).getDate();

  for(let day=1; day<=daysInMonth; day++){
    const date = new Date(year, month, day);
    date.setHours(0,0,0,0);

    const isPast = date < today;
    const el = document.createElement("div");
    el.className = "cal-day";
    el.textContent = String(day);

    if(isPast){
      el.classList.add("disabled");
    }else{
      el.addEventListener("click", () => {
        state.selectedDate = date;
        state.selectedTime = "";
        $$(".cal-day").forEach(x => x.classList.remove("selected"));
        el.classList.add("selected");
        renderTimes();
        updateNextButtonStates();
        updateLivePreview();
      });
    }

    if(state.selectedDate && dateKey(state.selectedDate) === dateKey(date)){
      el.classList.add("selected");
    }
    if(dateKey(today) === dateKey(date)){
      el.classList.add("today");
    }

    grid.appendChild(el);
  }

  renderTimes();
}

function generateTimeslots(){
  // Simple availability model:
  // weekdays: 3pm-8pm, weekends: 11am-4pm
  // times are in 15-min increments; we'll only show slots that fit the selected duration
  if(!state.selectedDate) return [];

  const d = new Date(state.selectedDate);
  const dow = d.getDay(); // 0 Sun .. 6 Sat

  const isWeekend = (dow === 0 || dow === 6);

  const startHour = isWeekend ? 11 : 15;
  const endHour = isWeekend ? 16 : 20;

  const increment = 15;
  const slots = [];

  for(let h=startHour; h<=endHour; h++){
    for(let m=0; m<60; m+=increment){
      const startMinutes = h*60 + m;
      const endMinutes = endHour*60;
      if(startMinutes + state.duration > endMinutes) continue;

      slots.push(`${pad2(h)}:${pad2(m)}`);
    }
  }

  // Add counselor “pattern” to feel real: remove some times deterministically
  const seed = (state.counselor || "x").split("").reduce((a,c)=>a+c.charCodeAt(0),0)
    + Number(dateKey(state.selectedDate).replaceAll("-",""));
  const filtered = slots.filter((t, idx) => ((idx + seed) % 7) !== 0); // remove ~1/7 of slots
  return filtered;
}

function renderTimes(){
  const sub = $("#timesSub");
  const grid = $("#timeGrid");
  grid.innerHTML = "";

  if(!state.selectedDate){
    sub.textContent = "Pick a date to see times.";
    $("#toStep3").disabled = true;
    return;
  }

  if(!state.counselor){
    sub.textContent = "Choose a counselor first (Step 1).";
    $("#toStep3").disabled = true;
    return;
  }

  const slots = generateTimeslots();
  sub.textContent = `${fmtDate(state.selectedDate)} • ${slots.length} openings`;

  const bookings = loadBookings();

  slots.forEach(t => {
    const startISO = combineStartISO(state.selectedDate, t);
    const booked = bookings.some(b => b.counselor === state.counselor && b.startISO === startISO);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "time";
    btn.textContent = fmtTime(t);

    if(booked){
      btn.classList.add("booked");
      btn.disabled = true;
    }else{
      if(state.selectedTime === t) btn.classList.add("selected");
      btn.addEventListener("click", () => {
        state.selectedTime = t;
        $$(".time").forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
        updateNextButtonStates();
        updateLivePreview();
      });
    }

    grid.appendChild(btn);
  });

  updateNextButtonStates();
}

function bindCalendarNav(){
  $("#prevMonth").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() - 1);
    renderCalendar();
  });
  $("#nextMonth").addEventListener("click", () => {
    calMonth.setMonth(calMonth.getMonth() + 1);
    renderCalendar();
  });

  $("#clearTime").addEventListener("click", () => {
    state.selectedTime = "";
    $$(".time").forEach(x => x.classList.remove("selected"));
    updateNextButtonStates();
    updateLivePreview();
  });

  $("#backTo1").addEventListener("click", () => goStep(1));
  $("#toStep3").addEventListener("click", () => {
    if(!canGoStep3()) return flashHint("#hint2");
    goStep(3);
  });
}

// Step 3 inputs
function bindStep3(){
  const map = [
    ["#fullName","fullName"],
    ["#pronouns","pronouns"],
    ["#email","email"],
    ["#phone","phone"],
    ["#notes","notes"]
  ];

  map.forEach(([sel, key]) => {
    $(sel).addEventListener("input", (e) => {
      state.details[key] = e.target.value;
      updateLivePreview();
    });
  });

  $("#backTo2").addEventListener("click", () => goStep(2));
  $("#toStep4").addEventListener("click", () => {
    if(!canGoStep4()) return flashHint("#hint3");
    goStep(4);
  });
}

// Step 4 summary + confirm
function renderSummary(){
  const box = $("#summaryBox");
  const startISO = state.selectedDate && state.selectedTime ? combineStartISO(state.selectedDate, state.selectedTime) : "";
  const endISO = startISO ? addMinutesISO(startISO, state.duration) : "";

  const when = startISO
    ? `${fmtDate(new Date(startISO))} • ${new Date(startISO).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})} – ${new Date(endISO).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}`
    : "—";

  box.innerHTML = `
    <div class="line"><div class="k">Counselor</div><div class="v">${escapeHtml(state.counselor || "—")}</div></div>
    <div class="line"><div class="k">Session type</div><div class="v">${escapeHtml(state.type || "—")}</div></div>
    <div class="line"><div class="k">Duration</div><div class="v">${state.duration ? `${state.duration} min` : "—"}</div></div>
    <div class="line"><div class="k">When</div><div class="v">${escapeHtml(when)}</div></div>
    <div class="line"><div class="k">Name</div><div class="v">${escapeHtml(state.details.fullName || "—")}</div></div>
    <div class="line"><div class="k">Email</div><div class="v">${escapeHtml(state.details.email || "—")}</div></div>
  `;
}

function bindConfirm(){
  $("#backTo3").addEventListener("click", () => goStep(3));

  $("#confirmBooking").addEventListener("click", () => {
    if(!canGoStep4()) return flashHint("#hint3");

    const startISO = combineStartISO(state.selectedDate, state.selectedTime);

    if(isBooked(state.counselor, startISO)){
      $("#liveChip").textContent = "Already booked";
      $("#liveChip").className = "chip warn";
      return;
    }

    const booking = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      counselor: state.counselor,
      type: state.type,
      duration: state.duration,
      startISO,
      endISO: addMinutesISO(startISO, state.duration),
      details: {...state.details},
      createdAt: new Date().toISOString()
    };

    const list = loadBookings();
    list.unshift(booking);
    saveBookings(list);

    // show success
    $("#afterConfirm").hidden = false;
    $("#confirmBooking").disabled = true;

    renderBookingList();
    updateNextAvailable();

    // stash latest for ICS download
    $("#downloadIcs").dataset.bookingId = booking.id;

    updateLivePreview();
  });

  $("#bookAnother").addEventListener("click", () => {
    // reset booking-specific fields but keep counselor/type/duration for convenience
    state.step = 1;
    state.selectedDate = null;
    state.selectedTime = "";
    state.details = { fullName:"", pronouns:"", email:"", phone:"", notes:"" };

    $("#fullName").value = "";
    $("#pronouns").value = "";
    $("#email").value = "";
    $("#phone").value = "";
    $("#notes").value = "";

    $("#afterConfirm").hidden = true;
    $("#confirmBooking").disabled = false;

    goStep(1);
  });

  $("#downloadIcs").addEventListener("click", () => {
    const id = $("#downloadIcs").dataset.bookingId;
    const booking = loadBookings().find(b => b.id === id);
    if(!booking) return;
    downloadICS(booking);
  });

  $("#clearBookings").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderBookingList();
    updateNextAvailable();
    if(state.step === 2) renderTimes();
  });
}

// Buttons state
function updateNextButtonStates(){
  $("#toStep2").disabled = !canGoStep2();
  $("#toStep3").disabled = !canGoStep3();
}

// Live preview
function updateLivePreview(){
  $("#liveCounselor").textContent = state.counselor || "—";
  $("#liveType").textContent = state.type || "—";
  $("#liveDuration").textContent = state.duration ? `${state.duration} min` : "—";

  let when = "—";
  if(state.selectedDate && state.selectedTime){
    const startISO = combineStartISO(state.selectedDate, state.selectedTime);
    const endISO = addMinutesISO(startISO, state.duration);
    when = `${fmtDate(new Date(startISO))} • ${new Date(startISO).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})} – ${new Date(endISO).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}`;
  }
  $("#liveWhen").textContent = when;

  const ready = canGoStep4();
  const chip = $("#liveChip");
  if(ready){
    chip.textContent = "Ready to book";
    chip.className = "chip good";
  }else{
    chip.textContent = "Not ready";
    chip.className = "chip";
  }

  // If confirmed already
  if(state.step === 4 && !$("#afterConfirm").hidden){
    chip.textContent = "Booked";
    chip.className = "chip good";
  }
}

// Booking list
function renderBookingList(){
  const wrap = $("#bookingList");
  const list = loadBookings();

  if(list.length === 0){
    wrap.innerHTML = `<div class="tiny muted">No saved bookings yet.</div>`;
    return;
  }

  wrap.innerHTML = "";
  list.slice(0, 6).forEach(b => {
    const start = new Date(b.startISO);
    const when = `${fmtDate(start)} • ${start.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}`;
    const div = document.createElement("div");
    div.className = "booking";
    div.innerHTML = `
      <div class="top">
        <div class="name">${escapeHtml(b.counselor)}</div>
        <div class="tag">${escapeHtml(b.type)}</div>
      </div>
      <div class="when">${escapeHtml(when)} • ${b.duration} min</div>
    `;
    wrap.appendChild(div);
  });
}

function updateNextAvailable(){
  // Show the earliest available slot for the currently selected counselor/duration (rough)
  const counselor = state.counselor || "Jordan Lee";
  const dur = state.duration || 30;

  // scan the next 20 days for first open slot
  const now = new Date();
  now.setHours(0,0,0,0);

  let found = null;
  for(let i=0;i<20;i++){
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    // mimic selected-duration logic by temporarily using it
    const savedDate = state.selectedDate;
    const savedDur = state.duration;
    const savedCouns = state.counselor;

    state.selectedDate = d;
    state.duration = dur;
    state.counselor = counselor;

    const slots = generateTimeslots();
    for(const t of slots){
      const startISO = combineStartISO(d, t);
      if(!isBooked(counselor, startISO)){
        found = { d, t };
        break;
      }
    }

    state.selectedDate = savedDate;
    state.duration = savedDur;
    state.counselor = savedCouns;

    if(found) break;
  }

  const el = $("#nextAvailableText");
  if(!el) return;

  if(!found){
    el.textContent = "No openings soon";
  }else{
    el.textContent = `${fmtDate(found.d)} • ${fmtTime(found.t)}`;
  }
}

// ICS export
function downloadICS(booking){
  const dtStart = toICSDate(new Date(booking.startISO));
  const dtEnd = toICSDate(new Date(booking.endISO));
  const uid = booking.id + "@betterdays.local";

  const title = `BetterDays Counseling (${booking.type})`;
  const desc = [
    `Counselor: ${booking.counselor}`,
    `Type: ${booking.type}`,
    `Duration: ${booking.duration} minutes`,
    booking.details.notes ? `Notes: ${booking.details.notes}` : ""
  ].filter(Boolean).join("\\n");

  const ics =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BetterDays//Counseling Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${toICSDate(new Date())}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${escapeICSText(title)}
DESCRIPTION:${escapeICSText(desc)}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "betterdays-appointment.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toICSDate(d){
  // UTC time format: YYYYMMDDTHHMMSSZ
  const y = d.getUTCFullYear();
  const mo = pad2(d.getUTCMonth()+1);
  const da = pad2(d.getUTCDate());
  const h = pad2(d.getUTCHours());
  const mi = pad2(d.getUTCMinutes());
  const s = pad2(d.getUTCSeconds());
  return `${y}${mo}${da}T${h}${mi}${s}Z`;
}
function escapeICSText(str){
  return String(str)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// Bind buttons between steps
function bindStep2Step4Nav(){
  $("#backTo1").addEventListener("click", () => goStep(1));
}

// init
function init(){
  setTimezoneInput();
  setYear();

  // default duration
  state.duration = Number($("#duration").value);

  bindSegmented();
  bindStep1();
  bindCalendarNav();
  bindStep3();
  bindConfirm();
  bindStepperClicks();

  renderBookingList();
  updateNextAvailable();
  updateLivePreview();
  updateNextButtonStates();

  // next available text loading -> set
  const calNow = new Date();
  calMonth = new Date(calNow.getFullYear(), calNow.getMonth(), 1);
  renderCalendar();

  // Step 2 nav back/next
  $("#backTo1").addEventListener("click", () => goStep(1));
  $("#toStep3").addEventListener("click", () => {
    if(!canGoStep3()) return flashHint("#hint2");
    goStep(3);
  });
}

document.addEventListener("DOMContentLoaded", init);
