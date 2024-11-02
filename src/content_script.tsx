/* const article = document.querySelector("article");

// `document.querySelector` may return null if the selector doesn't match anything.
if (article) {
  const text = article.textContent;
  const wordMatchRegExp = /[^\s]+/g; // Regular expression
  const words = text?.matchAll(wordMatchRegExp);
  // matchAll returns an iterator, convert to array to get word count
  const wordCount = [...(words || [])].length;
  const readingTime = Math.round(wordCount / 200);
  const badge = document.createElement("p");
  // Use the same styling as the publish information in an article's header
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  // Support for API reference docs
  const heading = article.querySelector("h1");
  // Support for article docs with date
  const date = article.querySelector("time")?.parentNode;
  let el = date ?? heading;

  // @ts-ignore
  (date ?? heading)?.insertAdjacentElement("afterend", badge);
}
 */


const textElements = document.querySelectorAll("*");
const ercEipElements = Array.from(textElements).filter(el => {
  return el.children.length === 0 && el.textContent?.match(/(ERC|EIP)-?\d{1,6}/);
});;


ercEipElements.forEach(el => {
  const innerHTML = el.innerHTML;
  const highlightedHTML = innerHTML.replace(/(ERC|EIP)-?\d{1,6}/g, '<span class="highlighted" style="background-color: yellow;">$&</span>');
  el.innerHTML = highlightedHTML;
});

const highlightedElements = document.querySelectorAll(".highlighted");

highlightedElements.forEach(el => {
  el.addEventListener("click", (event) => {
    const match = el.textContent?.match(/(ERC|EIP)-?\d{1,6}/);
    if (match) {
      const [fullMatch, type, number] = match[0].split(/-|(\d+)/);
      const link = type === "ERC"
        ? `https://github.com/ethereum/ERCs/blob/master/ERCS/erc-${number}.md`
        : `https://github.com/ethereum/EIPs/blob/master/EIPS/eip-${number}.md`;

      const popup = document.createElement("div");
      popup.innerHTML = `
      This is a highlighted ${type} standard. 
      <a href="${link}" target="_blank">View Document</a>
      <button id="close-popup" style="margin-left: 10px;">Close</button>
    `;
      popup.style.position = "absolute";
      popup.style.backgroundColor = "white";
      popup.style.border = "1px solid black";
      popup.style.padding = "5px";
      popup.style.zIndex = "1000";
      document.body.appendChild(popup);

      const rect = el.getBoundingClientRect();
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight}px`;

      const closeButton = popup.querySelector("#close-popup");
      closeButton?.addEventListener("click", () => {
        popup.remove();
      });
    }
  });
});