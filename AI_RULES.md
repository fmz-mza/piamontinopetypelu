# AI_RULES.md  

## Tech Stack  
- **React** (with TypeScript) for building the UI and application logic.  
- **React Router** for client-side navigation and routing.  
- **shadcn/ui** for prebuilt, customizable UI components (no direct editing).  
- **Tailwind CSS** for utility-based styling and responsive design.  
- **lucide-react** for icon components and icon management.  
- **React Hot Toast** for toast notifications (if needed).  
- **Environment Variables** for configuration (e.g., API keys, secrets).  

## Library Usage Rules  
- **shadcn/ui**: Use prebuilt components (e.g., buttons, modals) without modification. Create custom components only when necessary.  
- **Tailwind CSS**: Use utility classes for all styling. Avoid inline styles or CSS files unless required.  
- **React Router**: Keep all routes in `src/App.tsx`. Do not create separate route files unless scaling.  
- **lucide-react**: Use for icons only. Do not replace with custom icons unless specified.  
- **Third-party libraries**: Install via `dyad-add-dependency` and document in `package.json`.  
- **No hardcoded values**: Use environment variables for secrets or API keys.  
- **Component structure**: Keep components small (≤100 lines) and focused. Create new files for new components.  
- **No markdown code blocks**: All code must be output via `<dyad-write>`.