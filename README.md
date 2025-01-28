# LinkManager - Professional Link Management Platform

A modern web application for creating, managing, and sharing links with advanced features like password protection and analytics.

## Features

- User authentication with unique usernames and emails
- Create and manage links with custom names and descriptions
- Password protection for links
- Link analytics and statistics
- Responsive design for all screen sizes
- Profile management

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data management
- React Router for navigation

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Netlify Deployment

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Set build command to: `npm run build`
4. Set publish directory to: `dist`
5. Deploy!

### Heroku Deployment

1. Create a new Heroku app
2. Connect your GitHub repository
3. Add the following buildpacks:
   - heroku/nodejs
4. Set the following config vars:
   - NODE_ENV: production
5. Deploy from the Heroku dashboard

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License