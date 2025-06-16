const VERBOSE = true;

fetch(chrome.runtime.getURL('punchlines.json'))
  .then(response => response.json())
  .then(punchlines => {
    VERBOSE && console.log("[AdBusterZ] Punchlines chargées :", punchlines.length);

    const pattern = /(ads|doubleclick|google_ads|pubads|advertisement)/i;

    function replaceAd(el) {
      const descriptor = (el.getAttribute("src") || "") + " " +
                         (el.getAttribute("id") || "") + " " +
                         (el.getAttribute("name") || "") + " " +
                         (el.className || "");
      if (pattern.test(descriptor)) {
        const punchline = punchlines[Math.floor(Math.random() * punchlines.length)];
        const container = document.createElement("div");
        container.innerHTML = `<div style="background:#111;color:#0f0;padding:10px;font-family:sans-serif;">
          ${punchline}
        </div>`;
        el.replaceWith(container);
        VERBOSE && console.log("[AdBusterZ] Remplacé :", descriptor);
        return true;
      }
      return false;
    }

    document.querySelectorAll('iframe, div, section').forEach(el => replaceAd(el));

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (replaceAd(node)) return;
            node.querySelectorAll && node.querySelectorAll('iframe, div, section').forEach(el => replaceAd(el));
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    VERBOSE && console.log("[AdBusterZ] MutationObserver activé");
  })
  .catch(err => console.error("[AdBusterZ] Erreur lors du chargement des punchlines :", err));