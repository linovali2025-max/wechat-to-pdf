// 设置页面脚本

document.addEventListener('DOMContentLoaded', async () => {
  // 加载已保存的设置
  const settings = await chrome.storage.sync.get({
    email: ''
  });
  
  document.getElementById('email').value = settings.email;
  
  // 保存按钮点击事件
  document.getElementById('save').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    
    // 简单验证邮箱格式
    if (email && !email.includes('@')) {
      alert('请输入正确的邮箱地址');
      return;
    }
    
    // 保存到浏览器存储
    await chrome.storage.sync.set({
      email: email
    });
    
    alert('保存成功！');
  });
});
