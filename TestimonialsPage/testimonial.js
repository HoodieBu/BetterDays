const stories = {
  story1: {
    title: "Alex • Learning to calm the storm",
    tags: ["Anxiety", "Confidence"],
    text: `I lived with anxiety for years. Mornings felt like a race I didn’t train for.
My brain would predict the worst, and my body believed it.

What helped wasn’t one giant breakthrough — it was a small, repeatable habit:
I started naming what I was feeling and taking one slow breath before reacting.

Some days were still hard. But over time, the hard days stopped being my whole life.
If you’re reading this: start small. Small is still forward.`
  },
  story2: {
    title: "Jordan • Asking for help",
    tags: ["Depression"],
    text: `I thought asking for help meant I failed.
I thought it would make me a burden.

One day I sent a message that simply said: “I’m not okay.”
That sentence didn’t fix everything — but it opened a door.

Support didn’t look like perfection. It looked like people showing up.
Little by little, my world got lighter.

If you’re scared to reach out, I get it. But you deserve care.`
  },
  story3: {
    title: "Maya • Rest is healing",
    tags: ["Burnout", "Grief"],
    text: `Burnout made me feel empty. I couldn’t focus, I couldn’t sleep, and even fun felt exhausting.
I kept trying to “push through” — until my body finally said no.

What changed was permission:
Permission to rest. Permission to say “not today.”
Permission to heal without guilt.

It didn’t happen overnight, but I started coming back to myself.
If you’re tired: rest isn’t quitting — it’s recovery.`
  }
};

const modal = document.getElementById("storyModal");
const storyText = document.getElementById("storyText");
const modalTitle = document.getElementById("modalTitle");
const modalTags = document.getElementById("modalTags");

const closeBtn = document.getElementById("closeModalBtn");
const copyBtn = document.getElementById("copyStoryBtn");

const grid = document.getElementById("storyGrid");
const searchInput = document.getElementById("searchInput");
const chips = document.getElementById("chips");
const jumpBtn = document.getElementById("jumpToStories");

let activeFilter = "all";

function openModal(key){
  const s = stories[key];
  if (!s) return;

  modalTitle.textContent = s.title;

  modalTags.innerHTML = "";
  s.tags.forEach(t=>{
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    modalTags.appendChild(span);
  });

  storyText.textContent = s.text;

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  // small micro “pop” focus feel
  closeBtn.focus();
}

function closeModal(){
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

function matches(card){
  const q = searchInput.value.trim().toLowerCase();
  const tags = (card.getAttribute("data-tags") || "").toLowerCase();
  const quote = (card.querySelector(".quote")?.textContent || "").toLowerCase();

  const inText = !q || tags.includes(q) || quote.includes(q);

  const filterOk =
    activeFilter === "all" ||
    (card.getAttribute("data-tags") || "").split(" ").includes(activeFilter);

  return inText && filterOk;
}

function refresh(){
  [...grid.querySelectorAll(".card")].forEach(card=>{
    card.style.display = matches(card) ? "" : "none";
  });
}

grid.addEventListener("click", (e)=>{
  const card = e.target.closest(".card");
  if (!card) return;
  openModal(card.getAttribute("data-story"));
});

grid.addEventListener("keydown", (e)=>{
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card");
  if (!card) return;
  e.preventDefault();
  openModal(card.getAttribute("data-story"));
});

modal.addEventListener("click", (e)=>{
  if (e.target?.dataset?.close === "1") closeModal();
});

closeBtn.addEventListener("click", closeModal);

document.addEventListener("keydown", (e)=>{
  if (e.key === "Escape" && modal.style.display === "flex") closeModal();
});

copyBtn.addEventListener("click", async ()=>{
  try{
    await navigator.clipboard.writeText(storyText.textContent);
    copyBtn.textContent = "Copied!";
    setTimeout(()=> copyBtn.textContent = "Copy story", 1100);
  }catch{
    copyBtn.textContent = "Copy failed";
    setTimeout(()=> copyBtn.textContent = "Copy story", 1100);
  }
});

searchInput.addEventListener("input", refresh);

chips.addEventListener("click", (e)=>{
  const btn = e.target.closest(".chip");
  if(!btn) return;

  chips.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
  btn.classList.add("active");

  activeFilter = btn.dataset.filter;
  refresh();
});

jumpBtn.addEventListener("click", ()=>{
  document.getElementById("stories").scrollIntoView({behavior:"smooth", block:"start"});
});

refresh();
