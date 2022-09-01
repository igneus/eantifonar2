'use strict';

const apiEndpoint = 'http://localhost:3000/api/eantifonar/search'; // TODO replace with public API
const chantDetailUrl = (id) => 'http://localhost:3000/chants/' + id.toString();

const debug = true;

const container = document.createElement('div');
container.setAttribute('id', 'eantifonar-container');
document.body.prepend(container);

const containerPrint = (str) => {
    let span = document.createElement('span');
    span.appendChild(document.createTextNode(str));
    container.appendChild(span);
};

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

const highlight = (element, colour) => {
    if (debug) {
        element.style.border = '2px solid ' + colour;
    }
}

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
                containerPrint('API request unsuccessful (' + response.status.toString() + ')');
                console.log(response);
                return {};
            }

            return response.json();
        })
        .then(callback)
        .catch((error) => {
            containerPrint('could not make API request: ' + error);
            console.error(error);
        });
};

const addChantsToElements = (elements, responseData) => {
    let notFound = 0;
    elements.forEach((chantText, i) => {
        let options = responseData[i.toString()];
        if (null === options) {
            notFound++;
            chantText.setAttribute('class', chantText.getAttribute('class') + ' eantifonar-music-not-found');
            return;
        }

        let chantData = options[0];

        let img = document.createElement('img');
        img.setAttribute('src', chantData.image);
        img.setAttribute('alt', chantData.lyrics);

        let link = document.createElement('a');
        link.setAttribute('href', chantDetailUrl(chantData.id));
        link.setAttribute('class', 'eantifonar-image-link');
        link.appendChild(img);

        let parent = chantText.parentNode;
        parent.insertBefore(link, chantText.nextSibling);
    });

    containerPrint('scores loaded' + (notFound > 0 ? ', ' + notFound + ' chant/s missing' : ''));
};

let elements = [];
let query = [];

containerPrint('E-Antifonář 2');

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

containerPrint(query.length.toString() + ' chants found');

loadChants(query, (responseData) => addChantsToElements(elements, responseData));
