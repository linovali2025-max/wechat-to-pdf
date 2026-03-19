// Background service worker

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToPdf') {
    handleConvertToPdf(request.url, request.title)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleConvertToPdf(url, title) {
  try {
    const settings = await chrome.storage.sync.get({
      agentUrl: 'http://localhost:18789',
      agentToken: '',
      email: ''
    });
    
    if (!settings.email) {
      throw new Error('请先设置接收邮箱');
    }
    
    const response = await fetch(`${settings.agentUrl}/api/v1/agent/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.agentToken}`
      },
      body: JSON.stringify({
        message: `把这篇公众号文章转成PDF发我邮箱 ${url}`,
        context: {
          wechat_url: url,
          wechat_title: title,
          recipient_email: settings.email
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Agent API error: ${response.status}`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('[WeChat to PDF] Error:', error);
    return { success: false, error: error.message };
  }
}
