export {}

const BASE_URL = "https://vocabulai.vercel.app";

console.log("VocabulAI Background Service Worker Started")

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-vocabulai",
    title: "Ask VocabulAI: '%s'",
    contexts: ["selection"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ask-vocabulai" && info.selectionText) {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "OPEN_VOCAB_MODAL",
        text: info.selectionText
      })
    }
  }
})

// PROXY FETCH LISTENER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROXY_FETCH") {
    (async () => {
      try {
        const { endpoint, method, body } = message;
        const options: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // This relies on host_permissions to attach cookies
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        
        const data = await response.text();
        let responseData = data;
        try {
            responseData = JSON.parse(data);
        } catch (e) {
            // Not JSON, keep as text
        }

        sendResponse({
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      } catch (error: any) {
        sendResponse({
          ok: false,
          status: 500,
          statusText: error.message || "Internal Extension Error",
          data: null
        });
      }
    })();
    return true; // Keep the message channel open for the async response
  }
});
