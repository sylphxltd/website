# Sylphx Website

This is the official website for Sylphx Limited, built with [Nuxt 3](https://nuxt.com/) and styled with [UnoCSS](https://unocss.dev/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshtse8%2Fsylphx-website) <!-- Assuming the repo is now under shtse8/sylphx-website, please update if needed -->

## Features

*   **Nuxt 3:** Leveraging the power of Vue 3 and Vite for a fast development experience and optimized production builds.
*   **Server-Side Rendering (SSR):** Ensures fast initial page loads and good SEO.
*   **UnoCSS:** Utility-first CSS framework for rapid UI development.
*   **Responsive Design:** Adapts beautifully to all screen sizes, from mobile to desktop.
*   **Dark Mode:** User-toggleable light and dark themes.
*   **Iconify Icons:** Using Carbon icons via UnoCSS preset.
*   **Clean Codebase:** Well-structured components and pages.

## Project Structure

*   `/pages`: Contains the Vue components for each page route.
*   `/public`: Static assets like images and `favicon.ico`.
*   `/server`: Server-side API routes or middleware (if any).
*   `app.vue`: The main application template, including header and footer.
*   `nuxt.config.ts`: Nuxt configuration file.
*   `package.json`: Project dependencies and scripts.
*   `tsconfig.json`: TypeScript configuration.

## Setup and Development

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Build for Production

Build the application for production:

```bash
npm run build
```

Locally preview the production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deployment

This project is configured for easy deployment on [Vercel](https://vercel.com/). Simply connect your GitHub repository to Vercel for automatic CI/CD.

## Contact

*   **Website:** [sylphx.com](https://sylphx.com)
*   **Support:** [support@sylphx.com](mailto:support@sylphx.com)
*   **GitHub:** [github.com/sylphxltd](https://github.com/sylphxltd) <!-- Link to the official org -->

---

&copy; {{ new Date().getFullYear() }} Sylphx Limited. All rights reserved.
