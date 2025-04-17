# Tailwind CSS & PostCSS Configuration Guide

## Overview

To ensure compatibility with the latest Tailwind CSS and PostCSS integration, the frontend project must use the `@tailwindcss/postcss` package as the PostCSS plugin. Direct usage of `tailwindcss` as a PostCSS plugin is no longer supported and will cause build failures.

## Required Dependencies

Add the following to your `frontend/package.json` dependencies:

```json
"tailwindcss": "latest",
"@tailwindcss/postcss": "latest",
"postcss": "latest",
"autoprefixer": "latest"
```

> **Note:** `@tailwindcss/postcss` is required for Tailwind CSS to function as a PostCSS plugin in recent versions.

## PostCSS Configuration

Update `frontend/postcss.config.js` as follows:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

**Do NOT** use `tailwindcss` directly as a plugin key. This will result in the following error:

```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

## Migration Notes

- If upgrading from an older Tailwind CSS setup, replace any instance of `tailwindcss: {}` in your PostCSS config with `'@tailwindcss/postcss': {}`.
- Ensure `@tailwindcss/postcss` is installed and listed in your dependencies.

## Troubleshooting

- If you see the error above during build, verify both your `postcss.config.js` and `package.json` match the examples here.
- After updating, run your package manager's install command (e.g., `npm install` or `yarn install`) to ensure all dependencies are present.

## References

- [Tailwind CSS PostCSS Plugin Migration Guide](https://tailwindcss.com/docs/installation)
- [PostCSS Documentation](https://postcss.org/)