chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("ACTIVATE", activeInfo);
  chrome.scripting.executeScript({
    target: { tabId: activeInfo.tabId },
    files: ['js/content_script.js']
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.elements) {
    console.log({msgelements: message.elements})
    const uniqueElements = new Set(message.elements);
    chrome.action.setBadgeText({ text: uniqueElements.size.toString() });
  }
});