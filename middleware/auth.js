export default function requireAuth(req, res, next) {
  if (req.path === "/admin/login" || req.path === "/admin/logout") return next();
  if (req.method === "POST" && req.path === "/user") return next();
  if (req.path === "/" || req.path.startsWith("/dist/") || req.path.startsWith("/images/")) return next();

  if (!req.session?.userId) {
    return res.status(401).send("Unauthorized");
  }

  return next();
}
