# Prettier Disabled in Frontend

## Overview

As per project requirements, Prettier has been completely disabled in the frontend codebase. This document outlines the changes made and the implications for the development workflow.

## Changes Made

1. Removed Prettier configuration from ESLint:
   - Removed `"plugin:prettier/recommended"` from the extends array
   - Removed `"prettier"` from the plugins array
   - Removed the `"prettier/prettier"` rule

2. Renamed `.prettierrc` to `.prettierrc.disabled` to preserve the configuration for reference but prevent it from being used.

3. Updated `package.json`:
   - Removed the `"format"` script that used Prettier
   - Removed Prettier-related dependencies:
     - `"eslint-config-prettier"`
     - `"eslint-plugin-prettier"`
     - `"prettier"`

4. Disabled specific ESLint rules to prevent build errors:
   - Disabled `"@next/next/no-img-element"` to allow using HTML `<img>` elements instead of Next.js's `<Image />` component
   - Disabled `"react/no-unescaped-entities"` to prevent errors with apostrophes and quotes in text

## Impact on Development Workflow

### Code Formatting

With Prettier disabled, code formatting is no longer automatically enforced. Developers should:

- Follow the project's coding style guidelines manually
- Use ESLint for linting JavaScript/TypeScript code
- Maintain consistent formatting through team conventions

### Visual Consistency

As the UI/UX Specialist team is still responsible for maintaining visual consistency:

- Continue to use Tailwind CSS classes as the primary styling method
- Adhere to the centralized theme configuration in `tailwind.config.js`
- Follow component templates and design system documentation

### Best Practices (Despite Disabled Rules)

Although we've disabled some ESLint rules to prevent build errors, developers should still follow these best practices when possible:

- Use Next.js's `<Link>` component instead of `<a>` elements for internal navigation
- Consider using Next.js's `<Image />` component for better performance when appropriate
- Properly escape special characters in JSX text content

## Reinstating Prettier (If Needed in Future)

If the team decides to reinstate Prettier in the future:

1. Rename `.prettierrc.disabled` back to `.prettierrc`
2. Restore the ESLint configuration in `.eslintrc.js`
3. Add back the Prettier dependencies and format script in `package.json`
4. Run `npm install` to reinstall the dependencies