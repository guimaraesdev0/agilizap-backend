export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "9999 years",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "9999 years"
};
