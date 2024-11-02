/* function polling() {
  // console.log("polling");
  setTimeout(polling, 1000 * 30);
}

polling(); */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.elements) {
    console.log({msgelements: message.elements})
    const uniqueElements = new Set(message.elements);
    chrome.action.setBadgeText({ text: uniqueElements.size.toString() });
  }
});