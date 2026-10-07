const { getBackendUrl, getFrontendUrl } = await import("../../config.js");
console.log(JSON.stringify({ backend: getBackendUrl(), frontend: getFrontendUrl() }));
