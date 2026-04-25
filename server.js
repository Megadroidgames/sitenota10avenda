import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSigiloPayCheckout } from "./sigilopay.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.argv.includes("--prod");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const app = express();

app.use(express.json());

app.post("/api/sigilopay/checkout", async (req, res) => {
  const { product, contact, origin } = req.body ?? {};
  const result = await createSigiloPayCheckout({
    product,
    contact,
    origin,
    env: process.env,
  });

  return res.status(result.status).json(result.body);
});

const start = async () => {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
  });
};

start();
