// ==UserScript==
// @name         Telegram Web Translator — PT-BR
// @namespace    https://github.com/irandamata/TelegramWeb-Translator
// @version      1.0.0
// @description  Traduz mensagens do Telegram Web para português brasileiro sob demanda
// @author       irandamata
// @match        https://web.telegram.org/k/*
// @match        https://web.telegram.org/a/*
// @license      MIT
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      libretranslate.com
// ==/UserScript==

(function () {
  'use strict';

  const TARGET_LANG = 'pt';

  GM_addStyle(`
    .tg-translate-btn {
      margin-top: 4px;
      background: #1f2933;
      color: #00ff9c;
      border: 1px solid #00ff9c;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      cursor: pointer;
    }
    .tg-translate-btn:hover {
      background: #00ff9c;
      color: #000;
    }
    .tg-translated-text {
      font-size: 12px;
      opacity: 0.75;
      margin-top: 2px;
    }
  `);

  function translate(text, callback) {
    GM_xmlhttpRequest({
      method: 'POST',
      url: 'https://libretranslate.com/translate',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        q: text,
        source: 'auto',
        target: TARGET_LANG,
        format: 'text'
      }),
      onload: response => {
        try {
          const result = JSON.parse(response.responseText);
          callback(result.translatedText);
        } catch (e) {
          callback('[Erro ao traduzir]');
        }
      },
      onerror: () => callback('[Erro de conexão]')
    });
  }

  function addTranslateButton(messageEl) {
    if (messageEl.querySelector('.tg-translate-btn')) return;

    const button = document.createElement('button');
    button.textContent = '🌐 Traduzir';
    button.className = 'tg-translate-btn';

    button.onclick = () => {
      if (messageEl.querySelector('.tg-translated-text')) return;

      const text = messageEl.innerText.trim();
      if (!text) return;

      translate(text, translated => {
        const out = document.createElement('div');
        out.className = 'tg-translated-text';
        out.textContent = translated;
        messageEl.appendChild(out);
      });
    };

    messageEl.appendChild(button);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll('.message').forEach(addTranslateButton);
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
