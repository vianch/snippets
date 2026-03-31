<h1 align="center">
  Snippets
</h1>

<p align="center">
  <i align="center">A personal code snippet manager to save, organize, and share pieces of code</i>
</p>

<h4 align="center">
  <a href="https://github.com/vianch/snippets/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" style="height: 20px;">
  </a>
  <a href="https://github.com/vianch/snippets/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/vianch/snippets?color=yellow&style=flat-square" alt="contributors" style="height: 20px;">
  </a>
  <a href="https://github.com/vianch/snippets/issues">
    <img src="https://img.shields.io/github/issues/vianch/snippets?style=flat-square" alt="issues" style="height: 20px;">
  </a>
  <br>
  <a href="https://snippets.vianch.com">
    <img src="https://img.shields.io/badge/demo-snippets.vianch.com-7c3aed?style=flat-square" alt="live demo" style="height: 20px;">
  </a>
</h4>

<p align="center">
    <img width="2475" height="1917" alt="Screenshot 2026-03-20 at 14 05 39" src="https://github.com/user-attachments/assets/66b99fbc-f718-42ea-b7fb-0c2887a5fbec" />
</p>

## Introduction

**Snippets** is a web-based code snippet manager that lets you save, organize, tag, and retrieve pieces of code through an in-browser editor. Built for developers who want a fast, personal library for reusable code — without the overhead of a full note-taking app.

With Snippets you can:

- **Save and edit** code with full syntax highlighting via CodeMirror
- **Organize** snippets with tags, favorites, and trash
- **Search** across your entire snippet library instantly
- **Share** public snippets with a direct link
- **Switch themes** between Dracula, GitHub, and more
- **Support 13+ languages** — JavaScript, TypeScript, Python, Rust, Go, Java, SQL, and more
- **Capture snippets as screenshots** — Save and share your own or team snippets as images.

<details open>
<summary>
 Screenshots
</summary> <br />

<p align="center">
    <img width="49%" src="https://github.com/user-attachments/assets/023d3a29-9a3b-4a8b-a7d4-937ac5087ed0" alt="Dashboard view"/>
&nbsp;
    <img width="49%" src="https://github.com/user-attachments/assets/9573b494-94ae-40fa-baae-27526f18949c" alt="Snippet editor"/>
</p>

<p align="center">
    <img width="33%" alt="Screenshot 2026-03-20 at 14 04 02" src="https://github.com/user-attachments/assets/3e88bb40-3e3d-4f26-8a59-4c2858d81640" />
    <img width="33%" alt="Screenshot 2026-03-20 at 14 04 06" src="https://github.com/user-attachments/assets/f44bfa76-a732-482b-b01c-62f672d0e3eb" />
    <img width="33%" alt="Screenshot 2026-03-20 at 14 04 14" src="https://github.com/user-attachments/assets/32e6eeed-0213-4a5f-9161-ec31c4538c95" />
</p>

<p align="center">
  <img width="33%" alt="Screenshot 2026-03-20 at 14 02 10" src="https://github.com/user-attachments/assets/0bd45a96-cf82-478e-9f09-a69d091f17e2" />
</p>

<p align="center">
  <img width="33%" alt="Screenshot 2026-03-23 at 17 42 19" src="https://github.com/user-attachments/assets/45c6c695-b3dd-45f3-8377-db4046d56425" />
<img width="33%" alt="Screenshot 2026-03-23 at 17 42 29" src="https://github.com/user-attachments/assets/7014d676-2f30-4028-8796-735e065f0f9e" />
<img width="33%" alt="Screenshot 2026-03-23 at 18 18 05" src="https://github.com/user-attachments/assets/4448b9cc-e612-4b05-bea6-07efeb4f4b91" />

</p>

</details>

## Tech Stack

| Technology                                     | Purpose                                     |
| ---------------------------------------------- | ------------------------------------------- |
| [Next.js 16](https://nextjs.org/)              | React framework with App Router & Turbopack |
| [React 19](https://react.dev/)                 | UI library                                  |
| [TypeScript](https://www.typescriptlang.org/)  | Type safety                                 |
| [Supabase](https://supabase.com/)              | Auth & real-time database                   |
| [CodeMirror](https://codemirror.net/)          | In-browser code editor                      |
| [Zustand 5](https://github.com/pmndrs/zustand) | Lightweight state management                |
| [Vercel](https://vercel.com/)                  | Deployment & analytics                      |
| [Phosphor Icons](https://phosphoricons.com/)   | Icon set                                    |

## Getting Started

<details open>
<summary>
Prerequisites
</summary> <br />

- [Node.js](https://nodejs.org/) (v18+)
- [Yarn](https://yarnpkg.com/) package manager
- A [Supabase](https://supabase.com/) project (for auth and database)

</details>

<details open>
<summary>
Installation
</summary> <br />

1. Clone the repository and install dependencies:

```bash
git clone git@github.com:vianch/snippets.git
cd snippets
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in the required values:

| Variable                        | Description            |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_BASE_URL`          | Your app's base URL    |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

3. Start the development server:

```bash
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

</details>

## Available Scripts

| Script                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `yarn dev`             | Start the development server                                  |
| `yarn build`           | Build for production                                          |
| `yarn start`           | Run the production build                                      |
| `yarn lint`            | Run all linters (ESLint + Stylelint + Prettier)               |
| `yarn lint:code-style` | Run ESLint with auto-fix                                      |
| `yarn lint:style`      | Run Stylelint for CSS with auto-fix                           |
| `yarn lint:formatting` | Run Prettier with auto-write                                  |
| `yarn init`            | Reset project (removes node_modules & lock files, reinstalls) |

## Project Structure

```
app/
├── components/       # React components (each in its own directory)
│   └── ui/           # Reusable UI primitives (Button, Input, Modal, etc.)
├── lib/
│   ├── supabase/     # Supabase client & database queries
│   ├── store/        # Zustand stores (menu, toast, viewport, user)
│   ├── constants/    # App constants (menu items, toast types, CodeMirror config)
│   ├── config/       # Language extension mappings
│   └── models/       # Value objects (Snippet factory)
├── utils/            # Pure utility functions
├── snippets/         # Main app route (protected)
├── login/            # Auth route
└── tools/            # Tools section
types/                # Global TypeScript declarations (.d.ts)
```

## Supported Languages

CSS, C++, Go, HTML, Java, JavaScript, JSON, Markdown, PHP, Python, Rust, SQL, and YAML.

## License

This project is licensed under the [MIT License](./LICENSE).

## Author

Developed by [vianch](https://vianch.com) — info@vianch.com
