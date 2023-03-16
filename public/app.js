(() => {
  document.addEventListener('DOMContentLoaded', () => {
    wrap('zero', -100);
    wrap('thirty', 30 * 60);
    wrap('hour', 60 * 60);
    wrap('two', 60 * 60 * 2);
  })

  const wrap = (selector, seconds) => {
    document.getElementById(selector).addEventListener('click', () => {
      const expiry = Date.now() / 1000 + seconds;
      fetch('/set-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry })
      }).then(async (response) => { 
        if (response.ok) alert(await response.text());
      });
    })
  }
})()
