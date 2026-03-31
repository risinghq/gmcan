const NODE_ENV = process.env.NODE_ENV || 'development';

const FRONTEND_URLS = {
  production: "https://gmcan.unmsm.edu.pe",
  development: "http://localhost:4200"
};

const getFrontendUrl = () => {
  return FRONTEND_URLS[NODE_ENV] || FRONTEND_URLS.development;
};

module.exports = {
  getFrontendUrl
};
