"use strict";

import Home from './views/pages/Home.js'
import About from './views/pages/About.js'
import Error404 from './views/pages/Error404.js'
import PostShow from './views/pages/PostShow.js'
import Register from './views/pages/Register.js'

import Navbar from './views/components/Navbar.js'
import Bottombar from './views/components/Bottombar.js'

import Utils from './services/Utils.js'

// List of supported routes. Any url other than these routes will throw a 404 error
const routes = {
    '/': Home
    , '/about': About
    , '/p/:id': PostShow
    , '/register': Register
};


function lzw64_encode(s) {
    if (!s) return s;

    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var d = new Map();
    var s = unescape(encodeURIComponent(s)).split("");
    var word = s[0];
    var num = 256;
    var key;
    var o = [];

    function out(word, num) {
        key = word.length > 1 ? d.get(word) : word.charCodeAt(0);
        o.push(b64[key & 0x3f]);
        o.push(b64[(key >> 6) & 0x3f]);
        o.push(b64[(key >> 12) & 0x3f]);
    }

    for (var i = 1; i < s.length; i++) {
        var c = s[i];
        if (d.has(word + c)) {
            word += c;
        } else {
            d.set(word + c, num++);
            out(word, num);
            word = c;
            if (num == (1 << 18) - 1) {
                d.clear();
                num = 256;
            }
        }
    }

    out(word);
    return o.join("");
}

function lzw64_decode(s) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    var b64d = {};

    for (var i = 0; i < 64; i++) {
        b64d[b64.charAt(i)] = i;
    }

    var d = new Map();
    var num = 256;
    var word = String.fromCharCode(b64d[s[0]] + (b64d[s[1]] << 6) + (b64d[s[2]] << 12));
    var prev = word;
    var o = [word];

    for (var i = 3; i < s.length; i += 3) {
        var key = b64d[s[i]] + (b64d[s[i + 1]] << 6) + (b64d[s[i + 2]] << 12);
        word = key < 256 ? String.fromCharCode(key) : d.has(key) ? d.get(key) : word + word.charAt(0);
        o.push(word);
        d.set(num++, prev + word.charAt(0));
        prev = word;

        if (num == (1 << 18) - 1) {
            d.clear();
            num = 256;
        }
    }

    return decodeURIComponent(escape(o.join("")));
}

function createHash(obj) {
    const jsonString = JSON.stringify(obj);
    let hash = 0;

    if (jsonString.length === 0) {
        return hash.toString(16);
    }

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash.toString(16);
}

// The router code. Takes a URL, checks against the list of supported routes and then renders the corresponding content page.
const router = async () => {
    count_router++;

    if (count_router == 1) {
        // Lazy load view element:
        const header = null || document.getElementById('header_container');
        const footer = null || document.getElementById('footer_container');

        // Render the Header and footer of the page
        header.innerHTML = await Navbar.render();
        await Navbar.after_render();
        footer.innerHTML = await Bottombar.render();
        await Bottombar.after_render();
    }

    const content = null || document.getElementById('page_container');

    // Get the parsed URl from the addressbar
    let request = Utils.parseRequestURL()


    hash = createHash(request);
    let sessContent = sessionStorage.getItem(hash);

    if (typeof (sessContent) == "string") {
        content.innerHTML= lzw64_decode(sessContent);
        console.log('LZW64: ', content.innerHTML.length, sessContent.length);
        return;
    }


    // Parse the URL and if it has an id part, change it with the string ":id"
    let parsedURL = (request.resource ? '/' + request.resource : '/') + (request.id ? '/:id' : '') + (request.verb ? '/' + request.verb : '')

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    let page = routes[parsedURL] ? routes[parsedURL] : Error404
    content.innerHTML = await page.render();
    await page.after_render();

    sessionStorage.setItem(hash, lzw64_encode(content.innerHTML.toString()));
}

sessionStorage.clear();

let count_router = 0;
let hash = '';

// Listen on hash change:
window.addEventListener('hashchange', router);

// Listen on page load:
window.addEventListener('load', router);
