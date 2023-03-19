let expiry;

const isLocked = () => isNaN(expiry) || expiry < Date.now() / 1000;
const setLoading = async (isLoading) => {
  const overlay = document.getElementById('overlay');
  return new Promise(resolve => {
    overlay.style.display = 'flex';
    setTimeout(() => {
      if (isLoading) {
        overlay.classList.remove('disabled');
        setTimeout(() => { resolve() }, 200);
      } else {
        overlay.classList.add('disabled');
        setTimeout(() => {
          overlay.style.display = 'none';
          resolve()
        }, 1000);
      }
    }, 0);
  });
}

const fetchRemainingTime = async () => {
  const response = await fetch('/get-expiry');
  expiry = parseFloat(await response.text());
}

const wrapButton = (selector, seconds) => {
  document.getElementById(selector).addEventListener('click', async () => {
    const newExpiry = isLocked()
      ? Date.now() / 1000 + seconds
      : expiry + seconds;
    await setLoading(true);
    fetch('/set-expiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiry: newExpiry })
    }).then(async (response) => {
      if (response.ok) expiry = newExpiry;
    }).finally(() => { setLoading(false); });
  });
}

const makeTimeUntilString = () => {
  if (isLocked()) return "The Retropie is Locked"
  const diff = expiry - Date.now() / 1000;
  const minutes = Math.floor(diff / 60) % 60;
  const hours = Math.floor(diff / 3600);
  let message = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}, ` : '';
  return `${message}${minutes} minute${minutes > 1 ? 's' : '' } left`;
}

const updateUIText = (id, text) => document.getElementById(id).innerText = text
const updateUIElements = () => {
  updateUIText('remaining', makeTimeUntilString());
  updateUIText('thirty', isLocked() ? 'Allow for 30 minutes' : 'Add 30 minutes');
  updateUIText('hour', isLocked() ? 'Allow for 1 hour' : 'Add 1 hour');
  updateUIText('two', isLocked() ? 'Allow for 2 hours' : 'Add 2 hours');
}

document.addEventListener('DOMContentLoaded', async () => {
  await fetchRemainingTime();
  updateUIElements();
  setInterval(updateUIElements, 500);
  wrapButton('zero', -100 * 60);
  wrapButton('thirty', 30 * 60);
  wrapButton('hour', 60 * 60);
  wrapButton('two', 60 * 60 * 2);
  document.getElementById('content').classList.add('active');
  await setLoading(false);
});
