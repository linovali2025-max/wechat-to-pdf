(function() {
  'use strict';
  
  // 防止重复添加
  if (document.getElementById('wechat-pdf-btn')) {
    return;
  }
  
  // 只在微信公众号页面运行
  if (!window.location.href.includes('mp.weixin.qq.com')) {
    return;
  }
  
  // 创建按钮容器
  const container = document.createElement('div');
  container.id = 'wechat-pdf-container';
  container.innerHTML = `
    <button id="wechat-pdf-btn" title="转换为 PDF">📄 转PDF</button>
    <div id="wechat-pdf-menu" style="display: none;">
      <button id="wechat-pdf-standalone">💾 本地下载</button>
      <button id="wechat-pdf-agent">📧 发送邮件</button>
    </div>
  `;
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    #wechat-pdf-container {
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    #wechat-pdf-btn, #wechat-pdf-standalone, #wechat-pdf-agent {
      padding: 12px 20px;
      border: none;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    }
    #wechat-pdf-btn {
      background: #07C160;
      color: white;
    }
    #wechat-pdf-btn:hover {
      background: #06AD56;
      transform: translateY(-2px);
    }
    #wechat-pdf-standalone {
      background: white;
      color: #333;
    }
    #wechat-pdf-agent {
      background: #07C160;
      color: white;
    }
    #wechat-pdf-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(container);
  
  const btn = document.getElementById('wechat-pdf-btn');
  const menu = document.getElementById('wechat-pdf-menu');
  const standaloneBtn = document.getElementById('wechat-pdf-standalone');
  const agentBtn = document.getElementById('wechat-pdf-agent');
  
  // 点击主按钮显示/隐藏菜单
  btn.addEventListener('click', async () => {
    const settings = await chrome.storage.sync.get({ email: '' });
    
    if (menu.style.display === 'none') {
      menu.style.display = 'flex';
      // 没配置邮箱时隐藏"发送邮件"按钮
      agentBtn.style.display = settings.email ? 'block' : 'none';
    } else {
      menu.style.display = 'none';
    }
  });
  
  // 点击"本地下载"
  standaloneBtn.addEventListener('click', async () => {
    try {
      standaloneBtn.disabled = true;
      standaloneBtn.textContent = '⏳ 生成中...';
      
      const result = await StandalonePDF.generate();
      
      if (result.success) {
        standaloneBtn.textContent = '✅ 已打开';
        setTimeout(() => {
          standaloneBtn.textContent = '💾 本地下载';
          standaloneBtn.disabled = false;
        }, 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      standaloneBtn.textContent = '❌ 失败';
      alert('生成失败: ' + error.message);
      setTimeout(() => {
        standaloneBtn.textContent = '💾 本地下载';
        standaloneBtn.disabled = false;
      }, 3000);
    }
    menu.style.display = 'none';
  });
  
  // 点击"发送邮件"
  agentBtn.addEventListener('click', async () => {
    agentBtn.disabled = true;
    agentBtn.textContent = '⏳ 处理中...';
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'convertToPdf',
        url: window.location.href,
        title: document.title
      });
      
      if (response.success) {
        agentBtn.textContent = '✅ 已发送';
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      agentBtn.textContent = '❌ 失败';
      alert('发送失败: ' + error.message);
    }
    
    setTimeout(() => {
      agentBtn.textContent = '📧 发送邮件';
      agentBtn.disabled = false;
    }, 3000);
    menu.style.display = 'none';
  });
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
  
  console.log('[WeChat to PDF] 插件已加载');
})();
