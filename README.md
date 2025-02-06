
# LinkManager - Professional Link Management Platform

A modern web application for creating, managing, and sharing links with advanced features like password protection and real-time analytics.

## Features

- 🔐 User Authentication
- 🔗 Custom Link Management
- 📊 Real-time Analytics
- 🔒 Password Protection
- 📱 Responsive Design
- 🌙 Dark Mode Support
- 📈 Statistical Insights

## Tech Stack

- React 18 with TypeScript
- Vite for blazing-fast development
- Tailwind CSS for styling
- Shadcn UI components
- Supabase for backend services
- Framer Motion for animations
- Recharts for statistics visualization

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Supabase account (for backend services)

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd linkmanager
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Deployment

### Netlify Deployment

1. Fork or clone this repository
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=your-repo-url)

### Vercel Deployment

1. Fork or clone this repository
2. Import your repository to Vercel
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel dashboard
5. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

### Render Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Configure build settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
4. Add environment variables
5. Deploy!

## Environment Variables

Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
linkmanager/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom hooks
│   ├── integrations/  # Third-party integrations
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── types/         # TypeScript types
├── public/            # Static assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
