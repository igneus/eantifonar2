'use strict';

const lang = (() => {
    const j = new URLSearchParams(window.location.search).get('j');
    return (j === 'cz' || j === 'c2') ? 'cs' : j;
})();

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
    return nodeOwnText(node.children[0]) + ' | ' + nodeOwnText(node.children[2]);
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
        highlight: 'blue',
        textExtractor: responsoryText
    },
    {
        desc: 'Gospel antiphon',
        xpath: "//p[./span[@class='red' and contains(text(), 'Antifona k')]]",
        highlight: 'yellow'
    }
];

class BreviarSkEAntiphonal extends EAntiphonal {
    extractChantText(node) {
        return nodeOwnText(node);
    }

    decorateChantText(node, group) {
        if (this.debug) {
            node.style.border = '2px solid ' + group.highlight;
        }
    }

    decorateChantTextNotationMissing(node) {
        node.setAttribute('class', node.getAttribute('class') + ' eantifonar-music-not-found');
    }
}


new BreviarSkEAntiphonal(lang, elementGroups).run();
