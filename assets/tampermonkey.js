// ==UserScript==
// @name         BloxdCommunication
// @namespace    http://7granddadpgn.github.io
// @version      2024-07-29
// @description  A browser script made to generate tokens on bloxd.io
// @author       7GrandDad
// @match        https://bloxd.io/*
// @icon         https://bloxd.io/favicon.png
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

async function getTurnstileToken() {
    return new Promise(resolve => {
        unsafeWindow.turnstile.render("#arthurisstupid", {
            sitekey: "0x4AAAAAAAa4cz8QxEw-M2SE",
            theme: "dark",
            action: "Greenlight",
            retry: "never",
            "refresh-expired": "never",
            callback: function(token) {
                if (this.wrapper) this.wrapper.remove();
                resolve(token);
            }
        });
    });
}

(async function() {
	'use strict';
	const screen = document.createElement('div');
	screen.id = 'arthurisstupid';
	screen.style = "position: absolute; width: 100%; height: 100%; z-index: 10";
	const status = document.createElement('h');
	status.textContent = 'Bloxd Communication Script Status: Not Connected';
	status.style = "font-size: 2.2em; color: #FFF";
	screen.appendChild(status);

    // https://stackoverflow.com/questions/22141205/intercept-and-alter-a-sites-javascript-using-greasemonkey
    if(navigator.userAgent.indexOf("Firefox") != -1) {
        window.addEventListener("beforescriptexecute", function(e) {
            if(!(e.target.src.startsWith('https://challenges.cloudflare.com/turnstile/'))) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, false);
    } else {
        new MutationObserver(async (mutations, observer) => {
            let oldScript = mutations
                .flatMap(e => [...e.addedNodes])
                .filter(e => e.tagName == 'SCRIPT');

            for (const script of oldScript) {
                if (!(script.src.startsWith('https://challenges.cloudflare.com/turnstile/'))) script.type = 'javascript/blocked';
            }
        }).observe(document, {
            childList: true,
            subtree: true,
        });
    }

    const scr = document.createElement('script');
    scr.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded';
    document.head.appendChild(scr);

	await new Promise(resolve => {
		unsafeWindow.onTurnstileLoaded = resolve;
	});

    const web = new window.WebSocket('ws://localhost:6874');
	web.onmessage = async (event) => {
		if (event.data.startsWith('request')) {
			status.textContent = 'Bloxd Communication Script Status: Generating token...';
            const token = await getTurnstileToken();
			web.send(token);
			status.textContent = 'Bloxd Communication Script Status: Sent!';
		}
	};

	web.onopen = async (event) => {
		status.textContent = 'Bloxd Communication Script Status: Connected!';
	};

	web.onclose = async (event) => {
		status.textContent = 'Bloxd Communication Script Status: Not Connected';
	};

	document.body.appendChild(screen);
})();