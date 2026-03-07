## Packages
framer-motion | Smooth animations and page transitions
recharts | Dashboard analytics and charts
date-fns | Formatting dates for orders and customers
lucide-react | Already installed, but crucial for all icons
@hookform/resolvers | Already installed, needed for zod validation
zod | Already installed, needed for form schemas
uuid | For generating unique IDs in the mock data service

## Notes
- CRITICAL: App is completely FRONT-END ONLY for data persistence.
- All data is managed via `client/src/lib/dataService.ts` which uses `localStorage`.
- No actual backend endpoints (`/api/*`) are called.
- `dataService.ts` simulates network latency (400-800ms) to show skeleton loaders.
- Tailwind configuration assumes standard Shadcn UI setup.
- Custom fonts (Outfit, Plus Jakarta Sans) are imported via index.css.
