import { marked } from "marked";

const textElements = document.querySelectorAll("*");
const ercEipElements = Array.from(textElements).filter((el) => {
  return (
    el.children.length === 0 && el.textContent?.match(/(ERC|EIP)-?\d{1,6}/)
  );
});

const knownItems = JSON.parse(
  localStorage.getItem("ethStandards-knownItems") || "[]"
);
console.log({knownItems})


ercEipElements.forEach((el) => {
  const innerHTML = el.innerHTML;
  const highlightedHTML = innerHTML.replace(/(ERC|EIP)-?\d{1,6}/g, (match) => {
    const isKnown = knownItems.includes(match);
    const backgroundColor = isKnown ? "green" : "yellow";
    return `<span class="highlighted" style="background-color: ${backgroundColor}; color: black;">${match}</span>`;
  });
  el.innerHTML = highlightedHTML;
});

const highlightedElements = document.querySelectorAll(".highlighted");

highlightedElements.forEach((el) => {
  el.addEventListener("click", async (event) => {
    event.stopPropagation(); // Prevent event bubbling NOTE: doenst work
    const match = el.textContent?.match(/(ERC|EIP)-?(\d{1,6})/i);
    if (match) {
      const [fullMatch, type, number] = match;
      console.log({ match, fullMatch, type, number });
      const capitalizedType = type.toUpperCase();
      const link =
        capitalizedType === "ERC"
          ? `https://github.com/ethereum/ERCs/blob/master/ERCS/erc-${number}.md`
          : `https://github.com/ethereum/EIPs/blob/master/EIPS/eip-${number}.md`;
      const contentLink =
        capitalizedType === "ERC"
          ? `https://raw.githubusercontent.com/ethereum/ERCs/refs/heads/master/ERCS/erc-${number}.md`
          : `https://raw.githubusercontent.com/ethereum/EIPs/refs/heads/master/EIPS/eip-${number}.md`;

      const popup = document.createElement("div");
      popup.innerHTML = `
        This is a highlighted ${capitalizedType} standard. 
        <a href="${link}" target="_blank">View Document</a>
        <button id="close-popup" style="margin-left: 10px;">Close</button>
        <button id="mark-known" style="margin-left: 10px;">Mark as Known</button>
        <div id="popup-content">Loading...</div>
        <button id="close-popup" style="margin-left: 10px;">Close</button>
      `;
      popup.style.position = "absolute";
      popup.style.backgroundColor = "white";
      popup.style.border = "1px solid black";
      popup.style.padding = "5px";
      popup.style.zIndex = "1000";
      popup.style.color = "black";
      popup.style.width = "800px";
      document.body.appendChild(popup);

      const rect = el.getBoundingClientRect();
      let left = rect.left + window.scrollX;
      let top = rect.top + window.scrollY - popup.offsetHeight;

      // Adjust position to prevent overflow
      const popupWidth = popup.offsetWidth;
      const windowWidth = window.innerWidth;
      if (left + popupWidth > windowWidth) {
        left = windowWidth - popupWidth - 10; // 10px padding from the edge
      }
      console.log({ left, top, popupWidth, windowWidth, newLeft: left });
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;

      const closeButton = popup.querySelector("#close-popup");
      closeButton?.addEventListener("click", () => {
        popup.remove();
      });

      const markKnownButton = popup.querySelector("#mark-known");
      markKnownButton?.addEventListener("click", () => {
        const knownItems = JSON.parse(
          localStorage.getItem("ethStandards-knownItems") || "[]"
        );
        knownItems.push(`${capitalizedType}-${number}`);
        localStorage.setItem("ethStandards-knownItems", JSON.stringify(knownItems));
        popup.remove();
      });

      document.addEventListener(
        "click",
        (event) => {
          if (!popup.contains(event.target as Node)) {
            popup.remove();
          }
        },
        { once: true }
      );

      try {
        const response = await fetch(contentLink);
        const content = await response.text();
        const popupContent = popup.querySelector("#popup-content");
        if (popupContent) {
          const [yaml, ...rest] = content.split("---").slice(1);
          const mainContent = rest
            .join("---")
            .split("## Specification")[0]
            .trim();
          const htmlContent = marked(mainContent);
          popupContent.innerHTML = `
            <pre>${yaml.trim()}</pre>
            <hr>
            <div style="max-width: 800px;">${htmlContent}</div>
          `;
        }
        // if (popupContent) {
        //   popupContent.textContent = content;
        // }
      } catch (error) {
        const popupContent = popup.querySelector("#popup-content");
        if (popupContent) {
          popupContent.textContent = "Failed to load content.";
        }
      }
    }
  });
});
