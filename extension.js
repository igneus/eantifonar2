'use strict';

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
}

// invitatory; repetition of an antiphon after a psalm
doXPath("//p[./span[@class='red' and contains(text(), 'Ant.')]]")
    .forEach((antiphon) => antiphon.style.border = '2px solid red');

// psalm antiphons
doXPath("//p[./span[@class='red' and contains(text(), 'ant.')]]")
    .forEach((antiphon) => antiphon.style.border = '2px solid red');

// short responsory
doXPath("//div[@class='respons' and count(./p) > 2]")
    .forEach((antiphon) => antiphon.style.border = '2px solid blue');

// Gospel antiphon
doXPath("//p[./span[@class='red' and contains(text(), 'Antifona k')]]")
    .forEach((antiphon) => antiphon.style.border = '2px solid yellow');
