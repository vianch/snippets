# Public assets

`assets/images/` contains static images served from the site root at `/assets/images/`.

- `jpg/` contains illustrations used by the landing page.
- `png/` contains the app logo.
- `icons/` and `avatars/` contain interface artwork and selectable profile images.
- `pets/` contains SnipPet catalog entries. Each pet folder pairs `pet.json` metadata with a `spritesheet.webp` image; `scripts/pets.sync.mjs` keeps the runtime catalog in sync.

Do not place credentials, private user uploads, or user-specific records in `public/`: files here are publicly retrievable. Use the authenticated storage API for user data.
