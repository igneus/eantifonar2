'use strict';

const extensionHomepageUrl = 'https://github.com/igneus/eantifonar2';

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

const extensionNameLink = () => {
    let span = document.createElement('span');
    let link = document.createElement('a');
    link.setAttribute('href', extensionHomepageUrl);
    link.appendChild(document.createTextNode('E-Antifonář 2'));
    span.appendChild(link);

    return span;
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

const elementGroups = [
    {
        desc: 'invitatory; lone antiphon of the Daytime Prayer; repetition of an antiphon after a psalm',
        xpath: "//p[./span[@class='red' and contains(text(), 'Ant.')]]",
        highlight: 'orange'
    },
    {
        desc: 'psalm antiphons',
        xpath: "//p[./span[@class='red' and contains(text(), 'ant.')]]",
        highlight: 'red'
    },
    {
        desc: 'short responsory',
        xpath: "//div[@class='respons' and count(./p) > 2]",
        highlight: 'blue'
    },
    {
        desc: 'Gospel antiphon',
        xpath: "//p[./span[@class='red' and contains(text(), 'Antifona k')]]",
        highlight: 'yellow'
    }
];
let elements = [];
let query = [];

container.appendChild(extensionNameLink());

elementGroups.forEach((obj) => {
    doXPath(obj.xpath).forEach((element) => {
        highlight(element, obj.highlight);
        elements.push(element);
        query.push({lyrics: nodeOwnText(element)});
    });
});

containerPrint(query.length.toString() + ' chants found');

loadChants(query, (responseData) => addChantsToElements(elements, responseData));
