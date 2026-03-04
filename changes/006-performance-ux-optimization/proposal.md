# Proposal: Performance & Transparent UX Optimization

## Goal
Eliminate slow loading times and full-page refreshes. Implement "Optimistic UI" and efficient data fetching so that the application feels instant and transparent to Andrés & Mariana.

## Scope
- **Optimistic Updates**: Update the UI immediately when a transaction is added/deleted without waiting for the server/Google Sheets response.
- **Efficient Data Fetching**: Implement SWR or TanStack Query (React Query) for smart caching and background revalidation.
- **Partial Hydration**: Ensure only relevant components reload, not the entire page layout.
- **Skeleton Loaders**: Replace blank loading states with modern shadcn skeleton components.

## Context
Currently, the app relies on manual full-state refreshes after API calls, which causes a "clunky" feel given the Google Sheets API latency.
