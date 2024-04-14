'use strict';

const lang = 'cs';

const elementGroups = [
    {
        desc: 'introit',
        xpath: "//h4[contains(text(), 'Vstupní antifona')]/following-sibling::p[1]",
        highlight: 'orange'
    },
    {
        desc: 'responsorial psalm',
	// string(element) returns text content of the element and all its children
        xpath: "//h4[contains(string(.), 'Mezizpěv')]/following-sibling::p[1]",
        highlight: 'red'
    },
    /*
    {
        desc: 'alleluia / verse before the Gospel',
        xpath: "//h4[contains(string(.), 'Zpěv před evangeliem')]/following-sibling::p[1]",
        highlight: 'blue'
    },
    */
    {
        desc: 'communio',
        xpath: "//h4[contains(text(), 'Antifona k přijímání')]/following-sibling::p[1]",
        highlight: 'yellow'
    }
];

class MLiturgieCzEAntiphonal extends EAntiphonal {
    decorateChantText(node, group) {
        if (this.debug) {
            node.style.border = '2px solid ' + group.highlight;
        }
    }

    decorateChantTextNotationMissing(node) {
        node.setAttribute('class', node.getAttribute('class') + ' eantifonar-music-not-found');
    }
}


new MLiturgieCzEAntiphonal(lang, elementGroups).run();
