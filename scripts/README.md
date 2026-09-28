# Maintenance scripts

The scripts in this directory support asset synchronization and focused checks:

- `pets.sync.mjs` reads the pet asset catalog under `public/assets/images/pets/` and writes the generated runtime catalog used by the SnipPet feature. It is run by `pnpm pets:sync` and before `pnpm build`.
- `pet.utils.check.ts` and `table.utils.check.ts` are standalone focused checks for pet and table utility behavior.

The package scripts in the root `package.json` are the authoritative entry points. Review generated output after changing the asset catalog, and do not put account data or secrets in script fixtures.
