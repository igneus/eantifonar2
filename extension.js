'use strict';

const apiEndpoint = 'http://localhost:3000/api/eantifonar/search'; // TODO replace with public API

// TODO for debugging only
document.body.prepend(document.createTextNode('eantifonar loaded ======='));

// do XPath search, return result as Array
const doXPath = (xpath) => {
    const antiphons = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    let a = null;
    let r = [];
    while (a = antiphons.iterateNext()) {
        r.push(a);
    }

    return r;
};

// returns text contained directly in the node, ignoring text content of child elements
const nodeOwnText = (node) => {
    const clone = node.cloneNode(true);
    clone.childNodes.forEach((child) => {
        if (child.nodeType != Node.TEXT_NODE) {
            clone.removeChild(child);
        }
    });

    return clone.innerText.trim().replace(/\s+/g, ' ');
};

const responsoryText = (node) => {
    return nodeOwnText(node.children[0]) + ' V. ' + nodeOwnText(node.children[2]);
};

const highlight = (element, colour) => element.style.border = '2px solid ' + colour;

const loadChants = (query, callback) => {
    let payload = {};
    query.forEach((item, i) => payload[i.toString()] = item);

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    })
        .then((response) => {
            if (response.status != 200) {
                console.log(response);
                return {};
            }

            return response.json();
        })
        .then(callback)
        .catch(console.error);
};

const addChantsToElements = (elements, responseData) => {
    elements.forEach((chantText, i) => {
        let options = responseData[i.toString()];
        if (null === options) {
            return;
        }

        let chantData = options[0];
        let img = document.createElement('img');
        img.setAttribute('src', chantData.image);
        img.setAttribute('alt', chantData.lyrics);

        let parent = chantText.parentNode;
        parent.insertBefore(img, chantText.nextSibling);
    });
};

let elements = [];
let query = [];

// invitatory; repetition of an antiphon after a psalm
doXPath("//p[./span[@class='red' and contains(text(), 'Ant.')]]")
    .forEach((element) => {
        highlight(element, 'orange');
        elements.push(element);
        query.push({lyrics: nodeOwnText(element)});
    });

// psalm antiphons
doXPath("//p[./span[@class='red' and contains(text(), 'ant.')]]")
    .forEach((element) => {
        highlight(element, 'red');
        elements.push(element);
        query.push({lyrics: nodeOwnText(element)});
    });

// short responsory
doXPath("//div[@class='respons' and count(./p) > 2]")
    .forEach((element) => {
        highlight(element, 'blue');
        elements.push(element);
        query.push({lyrics: responsoryText(element)});
    });

// Gospel antiphon
doXPath("//p[./span[@class='red' and contains(text(), 'Antifona k')]]")
    .forEach((element) => {
        highlight(element, 'yellow');
        elements.push(element);
        query.push({lyrics: nodeOwnText(element)});
    });

loadChants(query, (responseData) => addChantsToElements(elements, responseData));
