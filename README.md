# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
# Copy this content to .env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

## API Integration

The application integrates with the backend API at `http://localhost:5000/api`.

### Login API
- **Endpoint**: `POST /user/login`
- **Request Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "Student",
      "avatar": "avatar_url"
    }
  }
  ```

## Environment Variables

Create a `.env` file with the following variable:
- `VITE_API_URL`: Your backend API URL (default: `http://localhost:5000/api`)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
