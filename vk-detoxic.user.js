// ==UserScript==
// @name         VK Detoxic
// @namespace    http://holov.in/vkdetoxic
// @version      0.0.1
// @description  Hey hey
// @author       Alexander Holovin
// @match        https://vk.com/im?sel=c*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // VARS
    const dialogName = '';
    const banUserId = '';

    // END VARS
    const target = document.querySelector('div.im-page-history-w');


    let lastMessageId = -1;
    let starterHandler;


    starter();

    function starter() {
        console.warn('[VA] started!');

        starterHandler = (e => {
            const currentDialogName = target.querySelector('span.im-page--title-main').title;
            console.warn(`[VA] Диалог: ${currentDialogName}`);

            if (currentDialogName === dialogName) {
                start();
                stopEvent(e);
            }
        });

        document.addEventListener('keydown', starterHandler, true);
    }

    function start() {
        document.removeEventListener('keydown', starterHandler, true);
        console.warn('[VA] Удаление слушателя');

        const messages = document.querySelectorAll('li.im-mess');

        processMessage(messages[messages.length - 1]);
        startObserver();
    }

    function stopEvent(e) {
        // console.log('[MU] Stop event: ', e);
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    function startObserver() {
        const config = {
            attributes: false,
            childList: true,
            characterData: true,
            subtree: true,
        };

        const observer = new MutationObserver(mutations => {
            // console.log('[MU] New: ', mutations);

            mutations.forEach(mutation => {
                if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
                    // console.log('[MU] Skip: ', mutation);
                    return;
                }

                const messageId = mutation.target.dataset.ts;

                if (!messageId || lastMessageId > messageId) {
                    // console.log(`skip scroll events, last: ${lastMessageId} > id ${messageId}`);
                    return;
                }

                lastMessageId = messageId;

                if (!mutation.target.classList.contains('im-mess') || mutation.target.classList.contains('im-mess_out')) {
                    // console.log('[MU] Skip unread/out messages', mutation);
                    return;
                }

                // console.warn('[MU]', mutation);
                processMessage(mutation.target);
            });
        });

        observer.observe(target, config);
    }

    function processMessage(mutation) {
        // li > ul > div.stackContent > div.messStack
        try {
            const elem = mutation.parentElement.parentElement.parentElement;
            const userId = elem.dataset.peer;

            if (userId === banUserId) {
                console.warn('[VA] fixed ok');
                elem.style.display = 'none';
            } else {
                console.log('[VA] skip');
            }

        } catch (error) {
            console.warn(`[VA] ${error}\n${error.stack}`);
        }
    }

    // TODO: use disconnect?
})();
