export function accountVerify(req, res, next) {
  console.log("SESSION:", req.session);
  if (!req.session.user) {
    return res.status(401).json({ error: "No user logged in to perform this action" });
  }
  next();
}

export function accountLogged(req, res, next) {
  if (req.session.user) {
    return res.status(409).json({ error: "User is already logged in" });
  }
  next(); 
}