// ---------- DATA (simple + editable) ----------
const ARTICLES = {
  featured: {
    tag: "Informational",
    read: "6 min",
    title: "Mental health basics: what it is (and what it isn’t)",
    sub: "A clear, non-overwhelming guide to understanding mental health and why it matters.",
    body: `
      <p>Mental health is your mind’s overall well-being — how you handle stress, relate to others, and feel day-to-day. It doesn’t mean “always happy.” It means having support, coping tools, and space to heal.</p>

      <h3>What mental health includes</h3>
      <ul>
        <li><b>Emotions:</b> how you feel and express feelings</li>
        <li><b>Thoughts:</b> patterns like self-talk and focus</li>
        <li><b>Stress response:</b> how your body and brain react under pressure</li>
        <li><b>Support:</b> friends, family, counselors, safe adults</li>
      </ul>

      <h3>What mental health is NOT</h3>
      <ul>
        <li>Not a “weakness”</li>
        <li>Not something you can always “snap out of”</li>
        <li>Not the same as personality</li>
      </ul>

      <h3>One simple way to start</h3>
      <p>Try a daily check-in: <b>What am I feeling?</b> <b>What do I need?</b> Even naming it helps your brain calm down.</p>
    `
  },
  anxiety1: {
    tag: "Anxiety",
    read: "4 min",
    title: "What Anxiety Really Feels Like",
    sub: "Anxiety is more than worry — it can be physical, mental, and exhausting.",
    body: `
      <p>Anxiety can feel like your brain won’t stop scanning for danger — even when nothing is “wrong.” It’s common, and it’s your nervous system trying to protect you.</p>

      <h3>Common signs</h3>
      <ul>
        <li>Racing thoughts or “what if” loops</li>
        <li>Chest tightness, shaky hands, fast heartbeat</li>
        <li>Feeling on-edge or easily irritated</li>
        <li>Overthinking texts, decisions, or mistakes</li>
      </ul>

      <h3>What helps (fast)</h3>
      <ul>
        <li><b>Exhale longer than you inhale</b> (signals safety)</li>
        <li><b>Grounding:</b> name 5 things you see</li>
        <li><b>Move:</b> short walk or stretching</li>
      </ul>

      <p>If anxiety is affecting school, sleep, or relationships often, talking to a counselor can really help.</p>
    `
  },
  depression1: {
    tag: "Depression",
    read: "5 min",
    title: "Depression vs. Sadness",
    sub: "Sadness is an emotion. Depression can feel like your energy, hope, and motivation disappear.",
    body: `
      <p>Sadness comes and goes. Depression can stick around and change how everything feels. Both deserve support.</p>

      <h3>Depression can include</h3>
      <ul>
        <li>Low energy, even after rest</li>
        <li>Not enjoying things you used to like</li>
        <li>Feeling numb, empty, or guilty</li>
        <li>Changes in sleep or appetite</li>
      </ul>

      <h3>Support matters</h3>
      <p>Depression isn’t laziness. It’s real. If you’re struggling, reaching out to a trusted adult or counselor is a strong move.</p>
    `
  },
  selfcare1: {
    tag: "Self-Care",
    read: "3 min",
    title: "Small Self-Care Habits That Actually Help",
    sub: "Self-care can be tiny — and still powerful.",
    body: `
      <p>Real self-care is anything that helps your mind and body recover.</p>

      <h3>Small ideas</h3>
      <ul>
        <li>Drink water before scrolling</li>
        <li>Put your phone across the room for 20 minutes</li>
        <li>Step outside for 60 seconds</li>
        <li>Write 3 words: “I feel ___.”</li>
      </ul>

      <p>Small habits work because they’re easy to repeat — repetition builds stability.</p>
    `
  },
  school1: {
    tag: "School Stress",
    read: "6 min",
    title: "Managing Stress During the School Year",
    sub: "You don’t need perfect productivity — you need a plan that protects your energy.",
    body: `
      <p>School stress builds when everything feels due at once. The goal isn’t doing more — it’s doing what matters without burning out.</p>

      <h3>Try this 3-step reset</h3>
      <ul>
        <li><b>Brain dump:</b> write everything stressing you out</li>
        <li><b>Pick 1–2 priorities:</b> not 10</li>
        <li><b>Time block:</b> 25 minutes work / 5 minutes break</li>
      </ul>

      <h3>Protect basics</h3>
      <ul>
        <li>Sleep</li>
        <li>Food</li>
        <li>Movement</li>
      </ul>

      <p>If stress turns into constant panic, consider talking to a counselor or checking the BetterDays resources page.</p>
    `
  },
  coping1: {
    tag: "Coping Skills",
    read: "4 min",
    title: "Coping Skills That Work in Real Life",
    sub: "Simple tools you can use anywhere — in a hallway, at home, or mid-stress.",
    body: `
      <p>Coping skills aren’t about “fixing” feelings — they help you ride them out safely.</p>

      <h3>Fast coping skills</h3>
      <ul>
        <li><b>Cold water:</b> splash face or hold something cool</li>
        <li><b>Box breathing:</b> 4 in / 4 hold / 4 out / 4 hold</li>
        <li><b>Music reset:</b> one calming song with slow breathing</li>
        <li><b>Text a safe person:</b> “Can you talk later?”</li>
      </ul>

      <p>Coping gets stronger the more you practice when things are only “a little” stressful.</p>
    `
  }
};

// ---------- MODAL ----------
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const closeBottom = document.getElementById("closeBottom");
const copyLink = document.getElementById("copyLink");

const modalTag = document.getElementById("modalTag");
const modalRead = document.getElementById("modalRead");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBody = document.getElementById("modalBody");

function openArticle(key){
  const a = ARTICLES[key];
  if(!a) return;

  modalTag.textContent = a.tag;
  modalRead.textContent = a.read;
  modalTitle.textContent = a.title;
  modalSub.textContent = a.sub;
  modalBody.innerHTML = a.body;

  modal.classList.add("open");
}

function closeArticle(){
  modal.classList.remove("open");
}

document.getElementById("openFeatured").addEventListener("click", () => openArticle("featured"));

document.querySelectorAll(".open-article").forEach(btn => {
  btn.addEventListener("click", () => openArticle(btn.dataset.article));
});

modalClose.addEventListener("click", closeArticle);
closeBottom.addEventListener("click", closeArticle);
modal.addEventListener("click", (e) => {
  if(e.target === modal) closeArticle();
});

// Copy article text
copyLink.addEventListener("click", async () => {
  const text = `${modalTitle.textContent}\n\n${modalSub.textContent}\n\n${modalBody.innerText}`;
  try{
    await navigator.clipboard.writeText(text);
    copyLink.textContent = "Copied ✓";
    setTimeout(()=> copyLink.textContent = "Copy Article Text", 1200);
  } catch {
    alert("Copy failed — your browser may block clipboard.");
  }
});

// ---------- FILTER + SEARCH ----------
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const filterWrap = document.getElementById("filters");
const cards = Array.from(document.querySelectorAll(".blog-card"));

let activeFilter = "all";

function apply(){
  const q = (searchInput.value || "").trim().toLowerCase();

  cards.forEach(card => {
    const tags = (card.dataset.tags || "").toLowerCase();
    const title = (card.dataset.title || "").toLowerCase();
    const text = (card.innerText || "").toLowerCase();

    const matchFilter = activeFilter === "all" || tags.includes(activeFilter);
    const matchSearch = !q || title.includes(q) || tags.includes(q) || text.includes(q);

    card.style.display = (matchFilter && matchSearch) ? "" : "none";
  });
}

filterWrap.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;

  filterWrap.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  activeFilter = btn.dataset.filter;
  apply();
});

searchInput.addEventListener("input", apply);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  apply();
  searchInput.focus();
});

// ---------- QUICK TOOLS MODAL ----------
const toolModal = document.getElementById("toolModal");
const toolClose = document.getElementById("toolClose");
const toolDone = document.getElementById("toolDone");
const toolCopy = document.getElementById("toolCopy");

const toolTitle = document.getElementById("toolTitle");
const toolSub = document.getElementById("toolSub");
const toolBody = document.getElementById("toolBody");
const toolTimer = document.getElementById("toolTimer");

let timerInterval = null;

function openTool(kind){
  clearInterval(timerInterval);
  toolTimer.textContent = "—";

  if(kind === "breathing"){
    toolTitle.textContent = "60-Second Breathing";
    toolSub.textContent = "Inhale 4 • Hold 2 • Exhale 6 (repeat)";
    toolBody.innerHTML = `
      <p><b>Try this:</b> Inhale for 4 seconds, hold for 2, exhale for 6. Repeat 6 times.</p>
      <ul>
        <li>Exhale longer than inhale = tells your body you're safe.</li>
        <li>Keep shoulders relaxed.</li>
      </ul>
      <p><b>Tip:</b> Count slowly in your head, or use a timer.</p>
    `;
    startTimer(60);
  }

  if(kind === "grounding"){
    toolTitle.textContent = "5–4–3–2–1 Grounding";
    toolSub.textContent = "A fast way to return to the present moment";
    toolBody.innerHTML = `
      <ul>
        <li><b>5</b> things you can see</li>
        <li><b>4</b> things you can feel</li>
        <li><b>3</b> things you can hear</li>
        <li><b>2</b> things you can smell</li>
        <li><b>1</b> thing you can taste</li>
      </ul>
      <p>Go slow. This helps your brain stop spiraling.</p>
    `;
  }

  if(kind === "journal"){
    toolTitle.textContent = "Journal Prompt";
    toolSub.textContent = "One question — no pressure to write a lot";
    const prompts = [
      "What’s been taking up space in my mind lately?",
      "What do I wish someone understood about me right now?",
      "If my stress could talk, what would it say?",
      "What’s one small thing I can do today that helps future me?"
    ];
    const pick = prompts[Math.floor(Math.random()*prompts.length)];
    toolBody.innerHTML = `
      <p><b>Prompt:</b> ${pick}</p>
      <p>Write 3–5 sentences or just keywords. Either counts.</p>
    `;
  }

  toolModal.classList.add("open");
}

function closeTool(){
  clearInterval(timerInterval);
  toolModal.classList.remove("open");
}

function startTimer(seconds){
  let remaining = seconds;
  toolTimer.textContent = `${remaining}s`;

  timerInterval = setInterval(() => {
    remaining--;
    toolTimer.textContent = `${remaining}s`;
    if(remaining <= 0){
      clearInterval(timerInterval);
      toolTimer.textContent = "Done ✓";
    }
  }, 1000);
}

document.querySelectorAll(".tool-card").forEach(btn => {
  btn.addEventListener("click", () => openTool(btn.dataset.tool));
});

toolClose.addEventListener("click", closeTool);
toolDone.addEventListener("click", closeTool);
toolModal.addEventListener("click", (e) => {
  if(e.target === toolModal) closeTool();
});

toolCopy.addEventListener("click", async () => {
  const text = `${toolTitle.textContent}\n${toolSub.textContent}\n\n${toolBody.innerText}`;
  try{
    await navigator.clipboard.writeText(text);
    toolCopy.textContent = "Copied ✓";
    setTimeout(()=> toolCopy.textContent = "Copy", 1200);
  } catch {
    alert("Copy failed — your browser may block clipboard.");
  }
});


copyLink.addEventListener("click", async () => {
  const text = `${modalTitle.textContent}\n\n${modalSub.textContent}\n\n${modalBody.innerText}`;
  try{
    await navigator.clipboard.writeText(text);

    // micro animation + nicer success state
    copyLink.classList.add("copied");
    copyLink.textContent = "Copied ✓";

    setTimeout(() => {
      copyLink.classList.remove("copied");
      copyLink.textContent = "Copy Article Text";
    }, 1200);

  } catch {
    copyLink.textContent = "Copy failed";
    setTimeout(()=> copyLink.textContent = "Copy Article Text", 1200);
  }
});

