import { createSigiloPaySitePayment } from "../../sigilopay.js";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Metodo nao permitido." }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let body;

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "Body JSON invalido." }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const origin = req.headers.get("origin") ?? body?.origin ?? "";
  const env = {
    SIGILOPAY_PUBLIC_KEY: globalThis.Netlify?.env.get("SIGILOPAY_PUBLIC_KEY"),
    SIGILOPAY_SECRET_KEY: globalThis.Netlify?.env.get("SIGILOPAY_SECRET_KEY"),
    SIGILOPAY_BASE_URL: globalThis.Netlify?.env.get("SIGILOPAY_BASE_URL"),
    SIGILOPAY_CHECKOUT_PRICE_UNIT: globalThis.Netlify?.env.get("SIGILOPAY_CHECKOUT_PRICE_UNIT"),
    SIGILOPAY_THANK_YOU_URL: globalThis.Netlify?.env.get("SIGILOPAY_THANK_YOU_URL"),
    SIGILOPAY_OPERATION_EMAIL_DOMAIN: globalThis.Netlify?.env.get("SIGILOPAY_OPERATION_EMAIL_DOMAIN"),
  };

  try {
    const result = await createSigiloPaySitePayment({
      product: body?.product,
      contact: body?.contact,
      document: body?.document,
      customerName: body?.customerName,
      origin,
      env,
    });

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Nao foi possivel acessar a base de clientes autorizados.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};

export const config = {
  path: "/api/sigilopay/pix",
};
