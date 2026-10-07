// Runs bootstrap() as the server does at startup, then prints the ids of public news matching argv[2], if given.
const { bootstrap } = await import("../../db/bootstrap.js");
await bootstrap();

const q = process.argv[2];
if (q !== undefined) {
  const { listPublicNews } = await import("../../services/news.service.js");
  const res = await listPublicNews("es", {
    q,
    sortBy: "publishedAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 50,
  });
  console.log(JSON.stringify(res.items.map((item) => item.id)));
}

process.exit(0);
