# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# 🐳 Waveon Project Setup Guide

This guide explains how to set up and run the Waveon project using **Docker Desktop**.

---

## 🚀 Prerequisites

Before you start, make sure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
---

## ⚙️ Step 1: Install and Start Docker Desktop

1. Download and install **Docker Desktop** from the link above.
2. Open Docker Desktop and make sure it is **running** before you continue.
    - You should see the Docker whale 🐋 icon in your macOS menu bar.

---

## 🖥️ Step 2: Run the Backend

1. Open the project in **IntelliJ IDEA**.
2. Navigate to the **backend** folder.
3. Start the backend service (for example, by running the main application file or using your build tool like Maven or Gradle if it’s a Spring Boot app).

---

## 🧱 Step 3: Start Docker Containers

1. Open the **Terminal** inside IntelliJ IDEA.
2. Run the following command:

   ```bash
   docker compose up
3. Docker will start all containers defined in the docker-compose.yml file.

4. You should see a running container called waveon in Docker Desktop — this contains your PostgreSQL database.

---

## 🗄️ Step 4: Connect to the Database in IntelliJ IDEA

In IntelliJ, open the Database tool window (on the right side).

Click the + button → Data Source → PostgreSQL.

Fill in the connection details:

**Database: waveondb**

**User: user**

**Password: password**

Click Apply, then Test Connection.

If the test succeeds, click OK to save the connection.

---

## ✅ Step 5: Verify the Connection

You should now see your PostgreSQL database (waveondb) connected in the Database tab.

You can browse tables, run SQL queries, and manage data directly from IntelliJ IDEA.

The database runs inside Docker, so it will stop when you close or stop your Docker containers.