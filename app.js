// app.js
document.addEventListener("DOMContentLoaded", () => {
  /* --------------------------
     FAQ toggle (accordion)
     -------------------------- */
  document.querySelectorAll(".faq-item h4").forEach(h => {
    h.addEventListener("click", () => {
      const answer = h.nextElementSibling;
      if (!answer) return;
      // close other answers (optional)
      document.querySelectorAll(".faq-item p").forEach(p => {
        if (p !== answer) p.style.display = "none";
      });
      answer.style.display = (answer.style.display === "block") ? "none" : "block";
      if (answer.style.display === "block") {
        setTimeout(() => h.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      }
    });
  });

  /* --------------------------
     Smooth scroll for nav links
     -------------------------- */
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener("click", (ev) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* --------------------------
     Download handler + modal
     -------------------------- */
  // Utility: create a simple modal if none exists
  function createDownloadModal() {
    // check again if one exists
    let existing = document.getElementById("downloadModalAuto");
    if (existing) return {
      modal: existing,
      bar: existing.querySelector(".progress-bar"),
      status: existing.querySelector(".download-status"),
      title: existing.querySelector(".download-title"),
      closeBtn: existing.querySelector(".download-close")
    };

    const modal = document.createElement("div");
    modal.id = "downloadModalAuto";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="downloadTitleAuto">
        <h3 id="downloadTitleAuto" class="download-title">Preparing download</h3>
        <div class="progress" style="width:100%; background:#111; border-radius:8px; overflow:hidden; margin-top:12px;">
          <div class="progress-bar" style="width:0%; height:14px; background:linear-gradient(90deg,#00cfff,#0099ff); transition:width .18s;"></div>
        </div>
        <div class="download-status" style="margin-top:10px;color:#ddd;font-size:0.95rem;">Preparing your download...</div>
        <div style="margin-top:12px;">
          <button class="download-close" style="padding:8px 12px;border-radius:6px;background:#111;color:#ddd;border:none;cursor:pointer;margin-top:8px;">Close</button>
        </div>
      </div>
    `;
    // basic modal styling helper to ensure visibility if user didn't include modal CSS.
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.background = "rgba(0,0,0,0.65)";
    modal.style.zIndex = "2200";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    modal.style.transition = "opacity .18s, visibility .18s";

    document.body.appendChild(modal);

    const obj = {
      modal,
      bar: modal.querySelector(".progress-bar"),
      status: modal.querySelector(".download-status"),
      title: modal.querySelector(".download-title"),
      closeBtn: modal.querySelector(".download-close")
    };

    // Close button
    obj.closeBtn.addEventListener("click", () => {
      hideModal(obj);
      if (obj._interval) { clearInterval(obj._interval); obj._interval = null; }
    });

    // Close by clicking outside content
    modal.addEventListener("click", (ev) => {
      const content = modal.querySelector(".modal-content");
      if (!content.contains(ev.target)) {
        hideModal(obj);
        if (obj._interval) { clearInterval(obj._interval); obj._interval = null; }
      }
    });

    // Escape key
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modal.style.visibility === "visible") {
        hideModal(obj);
        if (obj._interval) { clearInterval(obj._interval); obj._interval = null; }
      }
    });

    return obj;
  }

  function showModal(obj) {
    obj.modal.style.visibility = "visible";
    obj.modal.style.opacity = "1";
    obj.modal.setAttribute("aria-hidden", "false");
  }
  function hideModal(obj) {
    obj.modal.style.opacity = "0";
    obj.modal.style.visibility = "hidden";
    obj.modal.setAttribute("aria-hidden", "true");
    if (obj.bar) obj.bar.style.width = "0%";
    if (obj.status) obj.status.textContent = "";
  }

  // Main handler for download buttons
  document.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      // If link has href to actual file, proceed with modal+then navigate
      const href = btn.getAttribute("href") || btn.dataset.href || btn.dataset.file;
      if (!href) {
        // no href — do nothing special
        return;
      }

      // Prevent default immediate navigation so we can show modal first
      ev.preventDefault();

      const modalObj = createDownloadModal();
      modalObj.title.textContent = "Preparing download: " + (btn.dataset.file || href.split("/").pop());
      modalObj.status.textContent = "Preparing your download...";
      modalObj.bar.style.width = "0%";
      showModal(modalObj);

      // simulate short preparation progress then trigger actual download
      let value = 0;
      modalObj._interval = setInterval(() => {
        value += Math.random() * 20 + 8; // faster increments
        if (value >= 100) {
          value = 100;
          modalObj.bar.style.width = "100%";
          modalObj.status.textContent = "Starting download...";
          clearInterval(modalObj._interval);
          modalObj._interval = null;

          // Slight delay to allow user to see 100% then navigate
          setTimeout(() => {
            // Start real download / navigation
            // If the link is a blob/data URL or a real file path, navigation will trigger download or open
            window.location.href = href;
            // Hide modal after navigation attempt (if navigation doesn't immediately leave page)
            hideModal(modalObj);
          }, 450);
        } else {
          modalObj.bar.style.width = Math.floor(value) + "%";
          modalObj.status.textContent = "Preparing... " + Math.floor(value) + "%";
        }
      }, 300);
    });
  });

});

