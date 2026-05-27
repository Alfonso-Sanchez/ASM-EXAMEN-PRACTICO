const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const repo = "Alfonso-Sanchez/ASM-EXAMEN-PRACTICO";
const branch = "main";
const versionPath = path.join(root, ".app-version.json");
const updateFiles = [
  "index.html",
  "app.js",
  "styles.css",
  "README.md",
  "data/questions.json"
];
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

http.createServer(async (req, res) => {
  if (req.url === "/api/check-update") {
    await handleCheckUpdate(res);
    return;
  }

  if (req.url === "/api/apply-update" && req.method === "POST") {
    await handleApplyUpdate(res);
    return;
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(root, urlPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath)] || "text/plain; charset=utf-8"
    });
    res.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Pedalean2 exam app: http://127.0.0.1:${port}`);
});

async function handleCheckUpdate(res) {
  try {
    const latestCommit = await getLatestCommit();
    const current = readVersion();
    const packageAvailable = await remoteFileExists("index.html") && await remoteFileExists("data/questions.json");
    sendJson(res, 200, {
      repo,
      branch,
      currentCommit: current.commit,
      latestCommit,
      available: latestCommit !== current.commit,
      packageAvailable
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleApplyUpdate(res) {
  try {
    const latestCommit = await getLatestCommit();
    const updatedFiles = [];

    for (const file of updateFiles) {
      const content = await fetchRemoteFile(file);
      if (content == null) continue;
      const target = path.join(root, file);
      if (!target.startsWith(root)) throw new Error(`Ruta no permitida: ${file}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
      updatedFiles.push(file);
    }

    if (!updatedFiles.includes("index.html") || !updatedFiles.includes("data/questions.json")) {
      throw new Error("El repo no contiene un paquete de app completo.");
    }

    fs.writeFileSync(versionPath, JSON.stringify({
      name: "ASM - Examen Practico",
      version: latestCommit.slice(0, 7),
      repo,
      commit: latestCommit,
      updatedAt: new Date().toISOString()
    }, null, 2) + "\n");

    sendJson(res, 200, { ok: true, latestCommit, updatedFiles });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

async function getLatestCommit() {
  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, {
    headers: { "User-Agent": "asm-examen-practico-local-updater" }
  });
  if (!response.ok) throw new Error(`GitHub commit check failed: ${response.status}`);
  const data = await response.json();
  return data.sha;
}

async function remoteFileExists(file) {
  const response = await fetch(rawUrl(file), { method: "GET" });
  return response.ok;
}

async function fetchRemoteFile(file) {
  const response = await fetch(rawUrl(file));
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

function rawUrl(file) {
  return `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
}

function readVersion() {
  try {
    return JSON.parse(fs.readFileSync(versionPath, "utf8"));
  } catch {
    return { commit: "local" };
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}
