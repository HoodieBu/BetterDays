// =============================
  // Supabase (Polling Chat)
  // =============================
  const SUPABASE_URL = "https://mqarodxflqufushmeafa.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZWW781ULnCZUYxAwJVN3RA_1CwpHD4t";

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const els = {
    status: document.getElementById("status"),
    messages: document.getElementById("messages"),
    input: document.getElementById("input"),
    sendBtn: document.getElementById("sendBtn"),
    identityLabel: document.getElementById("identityLabel"),
    identitySub: document.getElementById("identitySub"),
    roomChips: document.getElementById("roomChips"),
    clearLocal: document.getElementById("clearLocal"),
  };

  // Rooms
  let currentRoom = "daily-check-in";

  // Identity (stored locally so it stays consistent)
  const NAME_KEY = "betterdays_display_name_v1";
  const POLL_MS = 2000;

  // State
  let sessionUserId = null;
  let displayName = null;
  let pollTimer = null;
  let lastSeenCreatedAt = null;

  const MAX_LEN = 280;
  const MIN_MS_BETWEEN_SENDS = 900;
  let lastSendAt = 0;

  function hashCode(str){
    let h = 0;
    for (let i=0;i<str.length;i++) h = ((h<<5)-h) + str.charCodeAt(i), h |= 0;
    return h;
  }

  function autogenName(seed) {
    const a = ["Blue","Sunny","Calm","Mellow","Gentle","Bright","Quiet","Kind","Soft","Silver"];
    const b = ["Sky","River","Wave","Leaf","Dawn","Cloud","Stone","Light","Garden","Harbor"];
    const n = Math.abs(hashCode(seed)).toString().slice(0,3);
    return `${a[Math.abs(hashCode(seed+"a")) % a.length]}${b[Math.abs(hashCode(seed+"b")) % b.length]}-${n}`;
  }

  function escapeHtml(s){
    return (s ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function nowTime(ts) {
    const d = ts ? new Date(ts) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function setStatus(text){
    els.status.innerHTML = `<span class="pulse"></span>${escapeHtml(text)}`;
  }

  function addMessageRow(m) {
    const mine = (m.user_id === sessionUserId);
    const div = document.createElement("div");
    div.className = "msg" + (mine ? " me" : "");
    div.dataset.createdAt = m.created_at;

    div.innerHTML = `
      <div class="meta">
        <div class="name">${escapeHtml(m.display_name)}</div>
        <div class="time">${nowTime(m.created_at)}</div>
      </div>
      <p class="text">${escapeHtml(m.content)}</p>
    `;
    els.messages.appendChild(div);
  }

  function scrollToBottom(){
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  async function ensureAnonSession(){
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.session;
  }

  async function loadInitial(room){
    els.messages.innerHTML = "";
    lastSeenCreatedAt = null;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: true })
      .limit(80);

    if (error) throw error;

    (data || []).forEach(addMessageRow);
    if (data && data.length) lastSeenCreatedAt = data[data.length - 1].created_at;
    scrollToBottom();
  }

  async function pollNew(room){
    let q = supabase
      .from("chat_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: true })
      .limit(50);

    if (lastSeenCreatedAt) q = q.gt("created_at", lastSeenCreatedAt);

    const { data, error } = await q;

    if (error) {
      console.error(error);
      setStatus("Polling error (check console)");
      return;
    }

    if (data && data.length) {
      data.forEach(addMessageRow);
      lastSeenCreatedAt = data[data.length - 1].created_at;
      scrollToBottom();
    }

    setStatus(`Live (polling) • ${room.replaceAll("-", " ")}`);
  }

  function startPolling(){
    stopPolling();
    pollTimer = setInterval(() => pollNew(currentRoom), POLL_MS);
  }

  function stopPolling(){
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  function canSend(text){
    const t = text.trim();
    if (!t) return false;
    if (t.length > MAX_LEN) return false;
    const now = Date.now();
    if (now - lastSendAt < MIN_MS_BETWEEN_SENDS) return false;
    return true;
  }

  async function sendMessage(){
    const content = els.input.value.trim();
    if (!canSend(content)) return;

    lastSendAt = Date.now();
    els.sendBtn.disabled = true;

    const { error } = await supabase.from("chat_messages").insert([{
      room: currentRoom,
      user_id: sessionUserId,
      display_name: displayName,
      content
    }]);

    if (error) {
      console.error(error);
      setStatus("Couldn’t send (RLS/Auth). Check console.");
    } else {
      els.input.value = "";
      els.input.style.height = "48px";
      await pollNew(currentRoom); // instant feedback
    }

    els.sendBtn.disabled = false;
    els.input.focus();
  }

  // Room switching
  function setRoom(room){
    currentRoom = room;
    [...els.roomChips.querySelectorAll(".chip")].forEach(c => {
      c.classList.toggle("active", c.dataset.room === room);
    });
    setStatus("Switching rooms…");
    loadInitial(room).then(startPolling);
  }

  els.roomChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    setRoom(chip.dataset.room);
  });

  // Composer UX
  els.input.addEventListener("input", () => {
    els.input.style.height = "48px";
    els.input.style.height = Math.min(140, els.input.scrollHeight) + "px";
    els.sendBtn.disabled = !canSend(els.input.value);
  });

  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  els.sendBtn.addEventListener("click", sendMessage);

  // Reset name (local only)
  els.clearLocal.addEventListener("click", () => {
    localStorage.removeItem(NAME_KEY);
    displayName = autogenName(sessionUserId);
    localStorage.setItem(NAME_KEY, displayName);
    els.identitySub.textContent = displayName;
    setStatus("Name refreshed");
  });

  // Boot
  (async function init(){
    try{
      setStatus("Joining…");
      const session = await ensureAnonSession();
      sessionUserId = session.user.id;

      const saved = localStorage.getItem(NAME_KEY);
      displayName = saved || autogenName(sessionUserId);
      localStorage.setItem(NAME_KEY, displayName);

      els.identityLabel.textContent = "Anonymous";
      els.identitySub.textContent = displayName;

      setStatus("Loading…");
      await loadInitial(currentRoom);

      els.sendBtn.disabled = false;
      els.input.focus();

      startPolling();
      setStatus(`Live (polling) • ${currentRoom.replaceAll("-", " ")}`);
    } catch (e) {
      console.error(e);
      setStatus("Setup error (check URL/key + Anonymous Auth)");
    }
  })();
