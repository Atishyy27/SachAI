// Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sachai-fact-check",
    title: "Fact-Check with SachAI",
    contexts: ["selection"] // This menu item will only appear when you select text
  });
});

// Listen for when the user clicks our context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sachai-fact-check") {
    // Store the selected text
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      // Open the popup window
      chrome.action.openPopup();
    });
  }
});