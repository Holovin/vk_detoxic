// ==UserScript==
// @name         VK Detoxic
// @namespace    https://holov.in/vkdetoxic
// @version      0.0.2
// @description  Hey hey
// @author       Alexander Holovin
// @match        https://vk.com/*
// @license      MIT
// @grant        none
// @noframes
// ==/UserScript==

window.addEventListener('load', detox, false);

function detox() {
    'use strict';
    console.warn('DetoxLoaded');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const dialogName = 'Тестировочная #2 (SF only)';
    const banUserId = '000';
    const banUserName = 'NAME';

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const pushStateFunction = history.pushState;
    const dialogTarget = document.querySelector('div.im-page-history-w');
    let lastMessageId = -1;
    let dialogObserver = null;

    detectChanges();

    history.pushState = function() {
        pushStateFunction.apply(history, arguments);
        setTimeout(detectChanges, 100);
    };

    function detectChanges() {
        const currentDialogName = dialogTarget.querySelector('span.im-page--title-main').title;
        console.warn(`[VA] Диалог: ${currentDialogName}`);

        if (!dialogObserver && currentDialogName === dialogName && document.location.search.includes('sel')) {
            console.warn('[VA] Детокс вкл.');

            hidePreloadedMessages();
            startChatObserver();
            return;
        }

        if (dialogObserver) {
            console.warn('[VA] Детокс выкл.');
            dialogObserver.disconnect();
            dialogObserver = null;
        }
    }

    function hidePreloadedMessages() {
        const messages = [...document.querySelectorAll('li.im-mess')].slice(-20);
        messages.forEach(item => processMessage(item));
    }

    function startChatObserver() {
        const config = { attributes: false, childList: true, characterData: true, subtree: true };
        dialogObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
                    return;
                }

                const messageId = mutation.target.dataset.ts;

                if (!messageId || lastMessageId > messageId) {
                    return;
                }

                lastMessageId = messageId;

                if (!mutation.target.classList.contains('im-mess') || mutation.target.classList.contains('im-mess_out')) {
                    return;
                }

                processMessage(mutation.target);
            });
        });

        dialogObserver.observe(dialogTarget, config);
    }

    function processMessage(element) {
        try {
            const messageElement = element.parentElement.parentElement.parentElement;
            const userId = messageElement.dataset.peer;

            if (userId === banUserId) {
                console.warn('[VA] fixed ok by user id');
                hideElement(messageElement);
                return;
            }

            const answerBlock = element.getElementsByClassName('im-replied--author-link _im_replied_author_link');

            if (answerBlock.length && answerBlock[0].text === banUserName) {
                console.warn('[VA] fixed ok by reply');
                hideElement(messageElement);
               return;
            }

            console.log('[VA] skip');

        } catch (error) {
            console.warn(`[VA] ${error}\n${error.stack}`);
        }
    }

    function hideElement(element) {
        element.style.display = 'none';
    }
}
