'use strict';

const lang = 'la';

const elementGroups = [
    {
        desc: 'antiphons',
        xpath: "//tr/td[1]//font[@color = 'red' and ./i[contains(text(), 'Ant.')]]/following-sibling::text()[1]"
    }
];

class DivinumOfficiumEAntiphonal extends EAntiphonal {
    extractChantText(node) {
        // here we are dealing with a text node, not with an HTML element
        return node.textContent;
    }

    setUpChantTextAnchor(node, anchorId) {
        // TODO: make this work
        // let span = document.createElement('span');
        // span.setAttribute('id', anchorId);
        // let parent = node.parentNode;
        // parent.insertBefore(node, span);
    }
}


new DivinumOfficiumEAntiphonal(lang, elementGroups).run();
