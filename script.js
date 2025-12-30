const chatBox = document.getElementById('chatBox');
const input = document.getElementById('wordInput');
const sendBtn = document.getElementById('sendBtn');

let kamusData = [];

// Ambil data JSON
fetch('data.json')
  .then(res => res.json())
  .then(data => kamusData = data.kamus);

// Autocomplete & prediksi kata
input.addEventListener('input', () => {
  const val = input.value.toLowerCase();
  closeAutocomplete();
  if (!val) return;

  const suggestions = kamusData.filter(item =>
    item.dayak.toLowerCase().startsWith(val) || item.indonesia.toLowerCase().startsWith(val)
  );

  if (suggestions.length > 0) {
    const list = document.createElement('div');
    list.className = 'autocomplete-suggestions';
    suggestions.forEach(s => {
      const div = document.createElement('div');
      div.className = 'autocomplete-suggestion';
      div.textContent = s.dayak;
      div.addEventListener('click', () => {
        input.value = div.textContent;
        closeAutocomplete();
      });
      list.appendChild(div);
    });
    input.parentNode.appendChild(list);
  }
});

function closeAutocomplete() {
  document.querySelectorAll('.autocomplete-suggestions').forEach(l => l.remove());
}

// Kirim pesan
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  closeAutocomplete();

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'message bot typing-indicator';
  typing.textContent = 'Bot sedang mengetik...';
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const translationHTML = translateSentence(text);
    addMessage(translationHTML, 'bot', true);
  }, 800 + Math.random()*1000);
}

function addMessage(content, sender, isHTML=false) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  if (isHTML) div.innerHTML = content;
  else div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Terjemahkan kalimat panjang dari kata per kata
function translateSentence(sentence) {
  const words = sentence.split(/\s+/);
  const translatedWords = words.map(w => {
    const item = kamusData.find(k => k.dayak.toLowerCase() === w.toLowerCase() || k.indonesia.toLowerCase() === w.toLowerCase());
    if (item) {
      const translated = (item.dayak.toLowerCase() === w.toLowerCase()) ? item.indonesia : item.dayak;
      return `<span class="highlight">${translated}</span>`;
    }
    return w;
  });
  return translatedWords.join(' ');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}