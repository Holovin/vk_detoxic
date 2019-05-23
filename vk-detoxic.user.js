// ==UserScript==
// @name         VK Detoxic
// @namespace    https://holov.in/vkdetoxic
// @version      0.0.4b
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
    console.warn('DetoxLoaded v4');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const dialogNames = ['ONE', 'TWO'];
    const banUserId = '000';
    const banUserName = 'NAME';
    const banUserLink = '/userlink';

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const pushStateFunction = history.pushState;
    let lastMessageId = -1;
    let dialogObserver = null;

    detectChanges();

    history.pushState = function() {
        pushStateFunction.apply(history, arguments);
        setTimeout(detectChanges, 100);
    };

    function detectChanges() {
        try {
            const dialogTarget = document.querySelector('div.im-page-history-w');

            if (!dialogTarget) {
                console.debug('[VA] Нет диалогов, пропуск');
                return;
            }

            const dialogElement = dialogTarget.querySelector('span.im-page--title-main');
            const currentDialogName = dialogElement.title;
            const isDialogOpen = !!dialogElement.offsetParent;
            console.debug(`[VA] Диалог: ${currentDialogName} ${isDialogOpen ? 'открыт' : 'закрыт'}`);

            if (dialogObserver) {
                console.warn('[VA] Детокс выкл.');
                dialogObserver.disconnect();
                dialogObserver = null;
            }

            if (isDialogOpen && dialogNames.includes(currentDialogName)) {
                console.warn('[VA] Детокс вкл.');

                hidePreloadedMessages();
                startChatObserver(dialogTarget);
            }

        } catch (error) {
            console.warn(`[VA] ${error}\n${error.stack}`);
            setTimeout(detectChanges, 100);
        }
    }

    function hidePreloadedMessages() {
        const messages = [...document.querySelectorAll('li.im-mess')].slice(-20);
        messages.forEach(item => processMessage(item));
    }

    function startChatObserver(dialogTarget) {
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
                console.warn('[VA] fixed ok: by user id');
                hideElement(messageElement);
                return;
            }

            const answerBlock = element.getElementsByClassName('im-replied--author-link _im_replied_author_link');
            if (answerBlock.length && answerBlock[0].text === banUserName) {
                hideStacked(element, 'reply');
                return;
            }

            const forwardBlock = element.getElementsByClassName('media_desc im-mess--inline-fwd');
            if (forwardBlock.length) {
                const userUrl = forwardBlock[0].getElementsByClassName('im_grid');

                if (userUrl.length && userUrl[0].href.indexOf(banUserLink) !== -1) {
                    hideStacked(element, 'forward');
                    return;
                }
            }

            console.debug('[VA] skip');

        } catch (error) {
            console.warn(`[VA] ${error}\n${error.stack}`);
        }
    }

    function hideElement(element) {
        console.log('Hide: ', element);
        element.style.display = 'none';
    }

    function fakeHideElement(element) {
        console.log('FakeHide: ', element);
        element.style.height = '1px';
        element.style.padding = '22px 0 0 0';
        element.style.opacity = '0';
    }

    function hideStacked(element, reason) {
        if (element.nextElementSibling) {
            console.warn(`[VA] fixed ok: by ${reason} (partial)`);
            fakeHideElement(element);
            return;
        }

        console.warn(`[VA] fixed ok: by ${reason} (full)`);
        hideElement(element);
    }
}
