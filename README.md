# Togglr Frontend

<div align="center">

**Modern React Frontend for Feature Toggle Management**

[![Docker Pulls](https://img.shields.io/docker/pulls/gdrocha/togglr-frontend)](https://hub.docker.com/r/gdrocha/togglr-frontend)
[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/togglr)](https://artifacthub.io/packages/search?repo=togglr)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

</div>

## Overview

Togglr Frontend is a modern, responsive React application built with TypeScript and Vite. It provides an intuitive interface for managing feature toggles, with role-based access control, real-time updates, and a professional dark/light theme system.

## ✨ Features

- **🎨 Modern UI**: Clean interface built with Shadcn/UI and TailwindCSS
- **🌓 Theme Support**: Dark/light mode with system preference detection
- **📱 Responsive Design**: Mobile-first design with collapsible sidebar
- **🔒 Role-Based Access**: Different interfaces for USER, MANAGER, and ADMIN roles
- **⚡ Real-Time Updates**: Instant feature toggle with optimistic UI updates
- **🔍 Advanced Filtering**: Search and filter by namespace, environment, and text
- **📊 Dashboard**: Comprehensive metrics and quick action buttons
- **🔔 Toast Notifications**: User feedback for all actions and errors

## 🚀 Quick Start

### Using Docker

```bash
# Run with Docker
docker run -d \
  -p 3000:80 \
  -e VITE_API_URL=http://localhost:8080/api/v1 \
  gdrocha/togglr-frontend:latest
```

### Using Kubernetes

```bash
# Add Helm repository
helm repo add togglr https://gdrocha-io.github.io/togglr-helm-charts
helm repo update

# Install
helm install my-togglr-frontend togglr/togglr-frontend
```

### Local Development

```bash
# Prerequisites: Node.js 18+
git clone https://github.com/gdrocha-io/togglr-frontend.git
cd togglr-frontend

# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:8080/api/v1" > .env.local

# Start development server
npm run dev
```

## 📋 Requirements

- **Node.js**: 18 or higher
- **Backend**: [Togglr Backend](https://github.com/gdrocha-io/togglr-backend) API running

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_DOMAIN` | Backend Domain | `http://localhost:8080` |
| `VITE_API_VERSION` | Backend API Version | `v1` |

### Build Configuration

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🏗️ Architecture

### Technology Stack
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.8.3**: Static typing and enhanced developer experience
- **Vite 5.4.19**: Fast build tool and development server
- **TailwindCSS 3.4.17**: Utility-first CSS framework
- **Shadcn/UI**: Modern component library built on Radix UI
- **TanStack Query 5.83.0**: Server state management and caching
- **React Router 6.30.1**: Client-side routing with protected routes

## 🔐 Security

### Authentication Flow
- JWT-based authentication with automatic token refresh
- Protected routes based on user roles
- Secure logout with token cleanup

### Role-Based Features
- **USER**: View and toggle features
- **MANAGER**: Create/edit features, namespaces, environments
- **ADMIN**: Full access including user management

## 🎨 UI Components

### Design System
- **Colors**: Semantic color system with theme support
- **Typography**: System fonts with consistent sizing
- **Spacing**: TailwindCSS spacing scale
- **Components**: Accessible components from Shadcn/UI

### Theme System
- **Dark/Light Mode**: Automatic system preference detection
- **Theme Persistence**: localStorage-based theme storage
- **Smooth Transitions**: Animated theme switching

## 🤝 Contributing

We welcome contributions!

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/togglr-frontend.git
cd togglr-frontend

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run lint
npm run build

# Submit pull request
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (via ESLint)
- **Component Structure**: Functional components with hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Accessible primitives

## 📞 Support

- 🐛 [Issue Tracker](https://github.com/gdrocha-io/togglr-frontend/issues)
- 💬 [Discussions](https://github.com/gdrocha-io/togglr-frontend/discussions)
- 📧 [Email](mailto:gabriel@gdrocha.io)

---

<div align="center">

**[⭐ Star this project](https://github.com/gdrocha-io/togglr-frontend) if you find it useful!**

Made with ❤️ by [Gabriel da Rocha](https://github.com/gdrocha)

</div>
