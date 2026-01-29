// api.ts - Now delegates to Background Script
export const api = {
  get: async (endpoint: string) => {
    return sendProxyRequest("GET", endpoint);
  },
  post: async (endpoint: string, body: any) => {
    return sendProxyRequest("POST", endpoint, body);
  }
};

// Helper to mimic the fetch Response interface
async function sendProxyRequest(method: string, endpoint: string, body?: any) {
  const response = await chrome.runtime.sendMessage({
    type: "PROXY_FETCH",
    endpoint,
    method,
    body
  });

  // Reconstruct a fetch-like Response object so the rest of the app doesn't need to change
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    json: async () => response.data,
    text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
  };
}