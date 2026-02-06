# Deployment (Nginx + PM2)

This project runs a single Node/Express server that also serves the React build.
The server listens on port 5000 and should be placed behind Nginx.

Files:
- nginx/technomk.conf: HTTP server block for techno-mk.ru and www.techno-mk.ru

Notes:
- Use PM2 with `ecosystem.config.js` in the repo root.
- Build the client with `npm run build` (from repo root) before starting the server.
- Run `node server/init-db.js` only for first-time database setup.
