# snippets

Snippets platform to save pieces of code
![snippetss](https://github.com/vianch/snippets/assets/1800887/5eaf70f8-7b3c-4a08-ae02-5cad90a9a380)

### Live demo

[Try the demo](https://snippets.vianch.com/)

## About

### What is snippets?

Snippets is a platform designed to help you save pieces of code and organize your development workflow. With Snippets, you can easily store and retrieve code snippets, making it easier to reuse and share code between projects.

### Why snippets?

By using Snippets, you can:

- Reduce repetition and improve code consistency
- Easily share and collaborate with others on code snippets
- Keep track of your progress and learn from previous work

## Features

- **Development Environment**: Utilizes Next.js for fast refresh and server-side rendering capabilities.
- **Code Quality Tools**: Integrated ESLint, Stylelint, and Prettier for consistent code style and formatting.
- **Language Support**: Extensive language support through CodeMirror, covering CSS, HTML, Java, JavaScript, JSON, Markdown, PHP, Python, Rust, SQL, and YAML.
- **Supabase Integration**: Includes Supabase for real-time database and authenticati+on helpers specifically tailored for Next.js applications.
- **Theming**: Dracula theme support for CodeMirror provided by `@uiw/codemirror-theme-dracula`.

## Getting Started

To get started with Snippets, clone the repository and install dependencies:

```bash
git clone git@github.com:vianch/snippets.git
cd snippets
yarn install
```

| Script       | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `yarn init`  | Resets the project setup by removing node modules and lock files, then reinstalls dependencies. |
| `yarn dev`   | Starts the development server.                                                                  |
| `yarn build` | Builds the application for production usage.                                                    |
| `yarn start` | Runs the built app in production mode.                                                          |
| `yarn lint`  | Runs all linting scripts for code style, styling, and formatting.                               |

### Linting

```bash
yarn lint
```

## Author

Developed by info@vianch.com. Feel free to reach out for any questions or contributions!

# Packages used

- icons: https://phosphoricons.com/
- code editor: https://codemirror.net/
- vercel: https://vercel.com/
- ShadCN: httcps://ui.shadcn.com/
- state: https://github.com/pmndrs/zustand
