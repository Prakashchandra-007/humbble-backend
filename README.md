# Humbble Backend (Open Source)

**Humbble Backend** is the core server-side infrastructure for _Humbble_ — an open-source, privacy-conscious alternative to popular dating platforms like Bumble. This backend is built using **NestJS** and **TypeScript**, offering scalable architecture, secure authentication, real-time messaging, and user matchmaking APIs. It powers all the core features of the Humbble mobile application, enabling developers to contribute to and customize a fully-functional dating app experience.

The project emphasizes **modularity, privacy, and transparency**, making it a great choice for developers and communities looking to launch a dating or social interaction platform with full control over their backend logic and user data.

---

## 🚀 Tech Stack

### Core Framework

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework for building efficient server-side applications
- **[TypeScript](https://www.typescriptlang.org/)** - Strongly typed programming language

### Database & ORM

- **[Neon Database](https://neon.tech/)** - Serverless PostgreSQL database
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript-first ORM with excellent type safety

### Authentication & Security

- **[JWT (JSON Web Tokens)](https://jwt.io/)** - Secure token-based authentication
- **[Passport.js](http://www.passportjs.org/)** - Authentication middleware
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing

### API & Documentation

- **[GraphQL](https://graphql.org/)** - Query language for APIs
- **[Apollo Server](https://www.apollographql.com/docs/apollo-server/)** - GraphQL server implementation
- **[Swagger/OpenAPI](https://swagger.io/)** - API documentation

### Validation & Utilities

- **[class-validator](https://github.com/typestack/class-validator)** - Decorator-based validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation
- **[libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js)** - Phone number validation

### Testing & Development

- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 🌍 Ideal For

- Developers exploring backend architecture for dating/social apps
- Startups and communities seeking open-source alternatives to closed dating platforms
- Contributors interested in privacy-respecting real-time applications
- Learning modern NestJS and TypeScript development patterns

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control system
- **PostgreSQL** (if running locally) or **Neon Database** account

---

## 🛠️ Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Prakashchandra-007/humbble-backend.git
cd humbble-backend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Environment Configuration

Create your environment configuration files:

```bash
# Copy the development environment template
cp env/.development.env env/.local.env
```

Edit `env/.local.env` with your database credentials:

```env
# Neon Database Configuration - Local Development
DATABASE_URL=postgresql://username:password@your-neon-host/your-database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=3600

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 4. Database Setup

#### Option A: Using Neon Database (Recommended)

1. Create a free account at [Neon](https://neon.tech/)
2. Create a new database project
3. Copy the connection string to your `.local.env` file
4. Run the database schema:

```bash
# Execute the schema file in your Neon database console
# Or use a PostgreSQL client to run src/database/schema.sql
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database:

```sql
CREATE DATABASE humbble_dev;
```

3. Run the schema:

```bash
psql -d humbble_dev -f src/database/schema.sql
```

### 5. Start the Development Server

```bash
# Development mode with auto-reload
npm run start:dev

# Or using yarn
yarn start:dev
```

The server will start on `http://localhost:3000`

### 6. Verify Installation

Visit the following endpoints to verify your setup:

- **Health Check**: `GET http://localhost:3000/`
- **API Documentation**: `http://localhost:3000/api` (Swagger UI)
- **GraphQL Playground**: `http://localhost:3000/graphql`

---

## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # Auth guards
│   ├── auth.controller.ts # Auth endpoints
│   ├── auth.service.ts    # Auth business logic
│   └── jwt.strategy.ts    # JWT strategy
├── users/                 # User management module
│   ├── dto/              # User DTOs
│   ├── users.controller.ts
│   └── users.service.ts
├── common/               # Shared utilities
│   ├── decorators/       # Custom decorators
│   ├── guards/           # Global guards
│   ├── logger/           # Logging service
│   └── validators/       # Custom validators
├── config/               # Configuration files
├── database/             # Database configuration & schema
└── types/                # TypeScript type definitions
```

---

## 🔧 Development Commands

```bash
# Development
npm run start:dev          # Start development server
npm run start:debug        # Start with debugger

# Building
npm run build              # Build for production
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

---

## 🤝 Development Standards & Contributing

### Code Style Guidelines

We follow strict coding standards to maintain code quality and consistency:

#### TypeScript Standards

- Use **strict TypeScript** configurations
- Prefer **interfaces** over types for object definitions
- Use **explicit return types** for all functions
- Implement proper **error handling** with custom exceptions

#### NestJS Patterns

- Follow **module-based architecture**
- Use **dependency injection** consistently
- Implement **DTOs** for all API endpoints
- Use **guards** for authentication/authorization
- Apply **interceptors** for cross-cutting concerns

#### Code Organization

- **One feature per module** principle
- **Separation of concerns** (Controller → Service → Repository)
- **Consistent naming conventions**:
  - PascalCase for classes and interfaces
  - camelCase for variables and functions
  - kebab-case for file names

### Git Workflow

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. **Write tests** for new functionality
5. Ensure all tests pass: `npm run test`
6. **Lint your code**: `npm run lint`
7. **Format your code**: `npm run format`
8. Commit with descriptive messages
9. Push to your fork and create a **Pull Request**

### Pull Request Guidelines

- **Clear description** of what the PR does
- **Reference any related issues**
- **Include tests** for new features
- **Update documentation** if needed
- **Ensure CI/CD passes**
- **Request reviews** from maintainers

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add Google OAuth integration
fix(users): resolve phone number validation issue
docs(readme): update setup instructions
```

### Testing Requirements

- **Unit tests** for all services and utilities
- **Integration tests** for controllers
- **E2E tests** for critical user flows
- **Minimum 80% code coverage** for new features

### Code Review Process

All contributions go through our code review process:

1. **Automated checks** (CI/CD pipeline)
2. **Peer review** by at least one maintainer
3. **Testing verification**
4. **Security review** for auth-related changes
5. **Documentation review** for API changes

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google` - Google OAuth login
- `GET /auth/profile` - Get user profile (authenticated)

### User Management

- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account

### Documentation Access

- **Swagger UI**: `http://localhost:3000/api`
- **GraphQL Playground**: `http://localhost:3000/graphql`

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check your DATABASE_URL format
# Ensure your Neon database is active
# Verify network connectivity
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=3001
```

#### JWT Token Issues

```bash
# Ensure JWT_SECRET is properly set
# Check token expiration settings
# Verify token format in requests
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/Prakashchandra-007/humbble-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Prakashchandra-007/humbble-backend/discussions)
- **Email**: humbble.opensource@gmail.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NestJS Team** - For the amazing framework
- **Neon Database** - For serverless PostgreSQL
- **Open Source Community** - For continuous inspiration

---

**Ready to contribute? We'd love to have you! 🚀**
