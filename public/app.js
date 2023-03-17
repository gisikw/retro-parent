(() => {
  const wrap = (selector, seconds) => {
    document.getElementById(selector).addEventListener('click', () => {
      const expiry = Date.now() / 1000 + seconds;
      fetch('/set-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry })
      }).then(async (response) => { 
        if (response.ok) setRemainingTime(expiry)
      });
    })
  }

  const syncRemainingTime = async () => {
    const response = await fetch('/get-expiry')
    const ts = parseInt(await response.text());
    setRemainingTime(ts)
  }

  const setRemainingTime = (timestamp) => {
    document.getElementById('remaining').innerText = makeTimeUntilString(timestamp)
  }

  const makeTimeUntilString = (timestamp) => {
    const now = Date.now() / 1000;
    if (isNaN(timestamp) || timestamp < now) return "The Retropie is Locked"
    const diff = timestamp - now;
    const minutes = Math.floor(diff / 60) % 60;
    const hours = Math.floor(diff / 3600);
    let message = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}, ` : '';
    return `${message}${minutes} minute${minutes > 1 ? 's' : '' } left`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    wrap('zero', -100);
    wrap('thirty', 30 * 60);
    wrap('hour', 60 * 60);
    wrap('two', 60 * 60 * 2);
    syncRemainingTime();
    setInterval(syncRemainingTime, 1000 * 10);
  })
})()
