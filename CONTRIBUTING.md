
# 🙌 Contributing to Humbble

Welcome to **Humbble** — an open-source backend project for a dating app built with **NestJS** and **Supabase**. We’re excited that you’re interested in contributing. This guide will help you get started smoothly.

---

## 🚀 Tech Stack

- **Backend Framework**: NestJS
- **Database & Auth**: Supabase
- **Authentication**: Supabase Auth + JWT
- **API Documentation**: Swagger (`@nestjs/swagger`)
- **Code Quality**: Prettier + ESLint

---

## ⚙️ Local Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

* Create a free account at [supabase.com](https://supabase.com)
* Create a new project
* Copy the **Project URL**, **Anon Key**, and **Service Role Key**

### 3. Configure environment

* Create a folder named `env/` in the project root
* Inside it, create a file `.development.env` and add the following:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_EXPIRES_IN=36000
```

### 4. Run the project

```bash
npm run start:dev
```

---

## 🧑‍💻 Code Standards

### ✅ Formatting & Linting

We use:

* **Prettier** for code formatting
* **ESLint** for linting

To run:

```bash
npm run format
npm run lint
```

### 📦 Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org):

Examples:

* `feat: add new user endpoint`
* `fix: correct phone validation bug`
* `docs: update setup guide`

---

## 🛠 Areas to Contribute

You can help with:

* 🔐 Role-based access control (`RolesGuard`)
* 🧪 Writing unit/e2e tests
* 🐛 Fixing bugs
* 📃 Improving documentation
* ✨ Adding features

Check the [issues](../../issues) section to find open tasks.

---

## 🚀 How to Contribute

1. **Fork** the repository
2. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Commit your code** using conventional commits
4. **Push and create a Pull Request**
5. Use a meaningful PR description:

   * What was added/changed
   * Related issues (if any)
   * Screenshots (if applicable)

---

## 📄 License

This project currently uses:

```json
"license": "MIT"
```
---

## 📜 Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please be respectful, inclusive, and constructive in all interactions.

---

Let’s build **Humbble** together — where quality meets connection ❤️
