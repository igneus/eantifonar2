# E-Antifonář 2

Firefox extension enhancing

- http://breviar.cz with chant scores from the [In adiutorium][ia] project
- https://divinumofficium.com/ and https://breviar.sk/la/ with chant scores from publicly available chant corpora

Developed as a (both legally and technically) less problematic replacement
of the original [E-Antifonář][ean] web app.

## Note on *Liturgia horarum* and *Ordo cantus officii*

When the post-Vatican II Divine Office (texts of which are now available at https://breviar.sk/la/)
is celebrated with chant, the document *Ordo cantus officii* applies,
prescribing chants often differing from the texts in the breviary.
This extension ignores the fact completely and only provides notation for the literal
breviary texts - if they are available in any of the chant corpora, which is often not the case.

## Installation

For now this extension has only been published as source on Github.

In order to install it from source please follow the official instructions
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Temporary_Installation_in_Firefox

This early development version additionally requires

- [adiutor][adiutor] with data properly imported and running at http://localhost:3000
- `security.mixed_content.block_active_content` Firefox configuration option set to false

## License

GNU/GPL 3

[ia]: http://www.inadiutorium.cz/
[ean]: https://github.com/igneus/eantifonar
[adiutor]: https://github.com/igneus/adiutor
