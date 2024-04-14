'use strict';

const manifest = browser.runtime.getManifest();
const extensionName = manifest.name;
const homepageUrl = manifest.homepage_url;

// TODO replace local URLs with public ones
const apiEndpoint = 'http://localhost:3000/api/eantifonar/search';

class StatusBar {
    constructor(elementId) {
        this.elementId = elementId;

        this.element = document.createElement('div');
        this.element.setAttribute('id', this.elementId);
    }

    // appends an arbitrary node
    append(node) {
        this.element.appendChild(node);
    }

    // adds a string, properly wrapped in nodes
    print(str) {
        let span = document.createElement('span');
        span.appendChild(document.createTextNode(str));
        this.append(span);
    }
}

/* Instrumentates the process of decorating a page with chants */
class EAntiphonal {
    constructor(lang, elementGroups) {
        this.lang = lang;
        this.elementGroups = elementGroups;

        this.debug = true;

        this.statusBarId = 'eantifonar-statusbar';
        this.statusBar = new StatusBar(this.statusBarId);
        this.statusBar.append(this.extensionNameLink());
    }

    run() {
        if (this.statusBarExists()) {
            console.log('already initialized, looks like extension was reloaded');
            return;
        }

        document.body.prepend(this.statusBar.element);

        let elements = [];
        let query = [];
        this.elementGroups.forEach((obj) => {
            doXPath(obj.xpath).forEach((element) => {
                this.decorateChantText(element, obj);
                elements.push(element);
                let lyrics = (obj.textExtractor ? obj.textExtractor : this.extractChantText)(element);
                query.push({lyrics: lyrics, lang: this.lang});
            });
        });

        this.statusBar.print(query.length.toString() + ' chants found');

        this.loadChants(query, (responseData) => this.addChantsToElements(elements, responseData));
    }

    extractChantText(node) {
        return node.innerText;
    }

    // allows decorating a detected chant text (before notation is loaded)
    decorateChantText(node, group) {
    }

    // allows decorating a chant text for which notation is not available (after notation is loaded)
    decorateChantTextNotationMissing(node) {
    }

    setUpChantTextAnchor(node, anchorId) {
        node.setAttribute('id', anchorId);
    }

    statusBarExists() {
        return null !== document.getElementById(this.statusBarId);
    }

    extensionNameLink() {
        let span = document.createElement('span');
        let link = document.createElement('a');
        link.setAttribute('href', homepageUrl);
        link.appendChild(document.createTextNode(extensionName));
        span.appendChild(link);

        return span;
    }

    loadChants(query, callback) {
        let payload = {};
        query.forEach((item, i) => payload[i.toString()] = item);

        fetch(apiEndpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
            .then((response) => {
                if (response.status != 200) {
                    this.statusBar.print('API request unsuccessful (' + response.status.toString() + ')');
                    console.log(response);
                    return {};
                }

                return response.json();
            })
            .then(callback)
            .catch((error) => {
                this.statusBar.print('could not make API request: ' + error);
                console.error(error);
            });
    }

    addChantsToElements(elements, responseData) {
        let notFound = 0;
        let notFoundLinks = document.createElement('span');

        elements.forEach((chantText, i) => {
            let options = responseData[i.toString()];
            if (null === options) {
                notFound++;
                this.decorateChantTextNotationMissing(chantText);

                // add link to the chant to the status bar
                let notFoundId = 'not-found-' + i;
                this.setUpChantTextAnchor(chantText, notFoundId);

                let link = document.createElement('a');
                link.setAttribute('href', '#' + notFoundId);
                link.appendChild(document.createTextNode('[' + i + ']'));
                notFoundLinks.appendChild(document.createTextNode(' '));
                notFoundLinks.appendChild(link);

                return;
            }

            // for now we take the first option and ignore the rest
            let chantData = options[0];

            let img = document.createElement('img');
            img.setAttribute('src', chantData.image);
            img.setAttribute('alt', chantData.lyrics);

            let link = document.createElement('a');
            link.setAttribute('href', chantData.browse_url);
            link.setAttribute('class', 'eantifonar-image-link');
            link.appendChild(img);

            let parent = chantText.parentNode;
            parent.insertBefore(link, chantText.nextSibling);
        });

        this.statusBar.print('scores loaded' + (notFound > 0 ? ', ' + notFound + ' chant/s missing' : ''));

        if (this.debug) {
            this.statusBar.append(notFoundLinks);
        }
    }
}

// do XPath search, return result as Array
const doXPath = (xpathExpression, contextNode = document) => {
    const antiphons = document.evaluate(xpathExpression, contextNode, null, XPathResult.ANY_TYPE, null);
    let a = null;
    let r = [];
    while (a = antiphons.iterateNext()) {
        r.push(a);
    }

    return r;
};
