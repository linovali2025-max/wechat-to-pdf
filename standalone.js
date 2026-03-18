const StandalonePDF = {
  extractContent() {
    const content = document.querySelector('#js_content');
    const title = document.querySelector('#activity_name, .rich_media_title');
    if (!content) {
      throw new Error('无法找到文章内容');
    }
    return {
      title: title ? title.textContent.trim() : 'WeChat Article',
      content: content.innerHTML,
      url: window.location.href
    };
  },

  createPrintHTML(data) {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.title}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.8; color: #333; max-width: 100%; margin: 0; padding: 20px; }
  h1 { font-size: 24px; margin-bottom: 20px; }
  img { max-width: 100%; height: auto; display: block; margin: 20px auto; }
  p { margin-bottom: 16px; text-align: justify; }
</style>
</head>
<body>
  <h1>${data.title}</h1>
  <div>${data.content}</div>
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
    来源：<a href="${data.url}">${data.url}</a>
  </footer>
</body>
</html>`;
  },

  async generate() {
    try {
      const data = this.extractContent();
      const printHTML = this.createPrintHTML(data);
      const blob = new Blob([printHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('弹窗被阻止，请允许弹窗后重试');
      }
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 500);
      };
      return { success: true, title: data.title };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
