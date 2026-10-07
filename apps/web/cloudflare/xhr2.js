// Angular imports xhr2 for server-side XHR, which the site never uses: HttpClient runs on fetch.
export default {
  get XMLHttpRequest() {
    throw new Error("XMLHttpRequest is not available in the Workers runtime; use HttpClient with fetch.");
  },
};
