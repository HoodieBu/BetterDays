// Sidebar items
const sidebarItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".disorder-section");
const infoBox = document.getElementById("infoBox");

// Fade in any already-visible disorder on initial load
window.addEventListener("DOMContentLoaded", () => {
  const visibleSection = document.querySelector(".disorder-section:not(.hidden)");
  if (visibleSection) {
    visibleSection.querySelectorAll(".fade-target").forEach(el => {
      el.classList.add("fade-in");
    });

    const infoBox = document.getElementById("infoBox");
    if (infoBox) infoBox.classList.add("fade-in");
  }
});


// ================================
// Fade-in animation function
// ================================
function triggerFade(sectionId) {
  const section = document.getElementById(sectionId);

  // Remove fade first
  section.querySelectorAll(".fade-target").forEach(el => {
    el.classList.remove("fade-in");
  });

  setTimeout(() => {
    section.querySelectorAll(".fade-target").forEach(el => {
      el.classList.add("fade-in");
    });
  }, 20);
}



// ================================
// Subtopic map (same as before)
// ================================
const subtopics = {
  anxiety: [
    { id: "anxiety-symptoms", label: "What is anxiety?" },
  ],

  depression: [
    { id: "depression-description", label: "What is depression?" },
    { id: "depression-causes", label: "What are the different types of depression?" },
    { id: "depression-treatments", label: "What causes depression?" }
  ],

  ptsd: [
    { id: "ptsd-descriptipn", label: "What is PTSD?" },
    { id: "ptsd-causes", label: "What causes post-traumatic stress disorder (PTSD)?" },
    { id: "ptsd-treatments", label: "Who is more likely to develop post-traumatic stress disorder (PTSD)?" },
    { id: "ptsd-symptoms", label: "What are the symptoms of post-traumatic stress disorder (PTSD)?" }
  ],


  bipolar: [
    { id: "bipolar-descriptipn", label: "What is bipolar disorder?" },
    { id: "bipolar-types", label: "What are the types of bipolar disorder?" },
    { id: "bipolar-causes", label: "What causes bipolar disorder?" },
    { id: "bipolar-risk", label: "Who is at risk for bipolar disorder?" },
    { id: "bipolar-symptoms", label: "What are the symptoms of bipolar disorder?" }
  ],

  ocd: [
    { id: "ocd-descriptipn", label: "What is OCD?" },
    { id: "ocd-causes", label: "What causes obsessive–compulsive disorder (OCD)?" },
    { id: "ocd-risk", label: "Who is at risk for obsessive–compulsive disorder (OCD)?" },
    { id: "ocd-symptoms", label: "What are the symptoms of obsessive–compulsive disorder (OCD)?" },
    { id: "ocd-compulsions", label: "Compulsions" },
  ],

  eating: [
    { id: "eating-descriptipn", label: "What are eating disorders?" },
    { id: "eating-types", label: "What are the types of eating disorders?" },
    { id: "eating-causes", label: "What causes eating disorders?" },
    { id: "eating-risk", label: "Who is at risk for eating disorders?" },
  ]
};



// ================================
// Show disorder function
// (Used by sidebar AND sub-disorder links)
// ================================
function showDisorder(disorderId, titleText) {

  // Hide all sections
  sections.forEach(s => s.classList.add("hidden"));

  // Show selected section
  const section = document.getElementById(disorderId);
  section.classList.remove("hidden");

  // Build "On This Page"
  let linksHTML = `
    <h2>${titleText}</h2>
    <p>On this page:</p>
    <div class="page-links">
  `;

  if (subtopics[disorderId]) {
    subtopics[disorderId].forEach(t => {
      linksHTML += `<a href="#${t.id}" class="page-link">${t.label}</a>`;
    });
  }

  linksHTML += `</div>`;

  infoBox.innerHTML = linksHTML;

  // FADE IN INFO BOX
  infoBox.classList.remove("fade-in");
  setTimeout(() => {
    infoBox.classList.add("fade-in");
  }, 20);


  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Fade in disorder content
  triggerFade(disorderId);

  // Smooth scroll for subtopic links
  document.querySelectorAll(".page-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.getAttribute("href").replace("#", "");
      const element = document.getElementById(targetId);
      element.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ================================
// Sidebar Clicks
// ================================
sidebarItems.forEach(item => {
  item.addEventListener("click", () => {

    // Active highlight
    sidebarItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const disorderId = item.getAttribute("data-target");
    const title = item.textContent.trim();

    showDisorder(disorderId, title);
  });
});



// ================================
// Sub-disorder Clicks (from inside the page)
// ================================
document.addEventListener("click", e => {
  if (e.target.classList.contains("sub-link")) {

    const disorderId = e.target.getAttribute("data-target");
    const title = e.target.textContent.trim();

    // Remove sidebar active highlight
    sidebarItems.forEach(i => i.classList.remove("active"));

    showDisorder(disorderId, title);
  }
});

window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});
