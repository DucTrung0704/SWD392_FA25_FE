# Setup Guide

## Environment Configuration

To run this application, you need to create a `.env` file in the root directory.

### Steps:

1. Create a file named `.env` in the root directory (same level as `package.json`)

2. Add the following content to the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

**Note:** The `.env` file has already been created for you in this project.

### For Production:

If deploying to production, update the `.env` file with your production API URL:

```env
VITE_API_URL=https://your-api-domain.com/api
```

### Important Notes:

- The `.env` file is already added to `.gitignore` to keep your API URLs private
- After creating/updating the `.env` file, **RESTART** your development server
- The API URL defaults to `http://localhost:5000/api` if no environment variable is set

## Testing the Login

Once the backend API is running on `http://localhost:5000`, you can test the login with:

- **Email**: `trung@gmail.com`
- **Password**: `123456`

Or any other valid credentials from your backend database.

## Next Steps

**IMPORTANT:** After creating the `.env` file:
1. Stop your development server (Ctrl+C)
2. Restart it with `npm run dev`
3. Try logging in
