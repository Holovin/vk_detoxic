// ==UserScript==
// @name         VK Detox 2
// @namespace    https://holov.in/ujs/VKD2
// @version      1.99.115
// @description  VK Detox 2
// @author       Alex Holovin
// @match        https://*.vk.com/*
// @copyright    Alex Holovin, based on https://openuserjs.org/scripts/flyink13/Web_Im_show_deleted_messages
// @license      MIT
// ==/UserScript==

/* global geByClass1 */

function showDeletedMessages() {
  const ID = 327617;

  console.log('[VK Detox] Running: 1.99.115');

  XMLHttpRequest.prototype.send = (function buildFakeSend(sendOrg) {
    return function fakeSend(...sendArgs) {
      const self = this;
      self.onreadystatechange = (function buildFakeOnChang(changeOrg) {
        if (!changeOrg) { return; }

        return function fakeOnReadyStateChange(...changeArgs) {
          const isLongPoll = (/^https:\/\/.?im(v4)?\.vk\.com\/.?im\d+/.test(self.responseURL));
          const isReady = (self.readyState === 4);

          if (isLongPoll && isReady && self.responseText) {
            try {
              const newJson = JSON.parse(self.responseText);

              newJson.updates.forEach((update) => {
                // console.log(update); // debug

                const isTyping = (update[0] === 63 && update[2] === ID);
                if (isTyping) {
                  // TODO
                }

                const isMessage = (update[0] === 4 && update[7].from == ID);
                if (isMessage) {
                  setTimeout(() => {
                    const el = geByClass1('_im_mess_' + update[1]).parentElement.parentElement.parentElement;
                    el.style.filter = 'blur(8px) opacity(0.5)';
                    el.parentElement.style.overflow = 'hidden';
                  });
                }

                const isReply = (update[0] === 4 && update[7].marked_users[0].find(subArr => Array.isArray(subArr) && subArr.includes(ID)));
                if (isReply) {
                  setTimeout(() => {
                    const el = geByClass1('_im_msg_reply' + update[1] + ' > div')
                    el.style.filter = 'blur(8px) opacity(0.5)';
                    el.parentElement.style.overflow = 'hidden';
                  });
                }
              });

            } catch(e) {}
          }

          return changeOrg.apply(self, changeArgs);
        };
      })(self.onreadystatechange);

      return sendOrg.apply(self, sendArgs);
    };
  })(XMLHttpRequest.prototype.send);
}

(function injectScript() {
  const script = document.createElement('script');
  const code = '(' + showDeletedMessages + ')();';
  script.appendChild(document.createTextNode(code));
  (document.body || document.head || document.documentElement).appendChild(script);
})();
