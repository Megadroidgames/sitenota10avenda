import { getRandomCustomer } from "./customerDatabase.js";

const DEFAULT_SIGILO_API_BASE_URL = "https://app.sigilopay.com.br/api/v1";
const DEFAULT_OPERATION_EMAIL_DOMAIN = "unirecargabr.shops";

const normalizeCheckoutPrice = (price, checkoutPriceUnit) => {
  if ((checkoutPriceUnit ?? "centavos").toLowerCase() === "reais") {
    return Number(price.toFixed(2));
  }

  return Math.round(price * 100);
};

const buildCustomer = (contact) => {
  const trimmed = typeof contact === "string" ? contact.trim() : "";

  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("@")) {
    return { email: trimmed };
  }

  return { phone: trimmed };
};

const buildPixClient = (contact, name = "Cliente Telegram", document = "", extraEmail = "") => {
  const trimmed = typeof contact === "string" ? contact.trim() : "";
  const digits = typeof document === "string" ? document.replace(/\D/g, "") : "";
  const email = typeof extraEmail === "string" ? extraEmail.trim() : "";

  if (!trimmed) {
    return null;
  }

  const client = { name };

  if (trimmed.includes("@")) {
    client.email = trimmed;
  } else {
    client.phone = trimmed.replace(/\D/g, "");
    if (email) {
      client.email = email;
    }
  }

  if (digits) {
    client.document = digits;
  }

  return client;
};

const normalizeEmailLocalPart = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");

const isLocalUrl = (value) => {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
};

const getThankYouPage = (origin, explicitThankYouUrl) => {
  if (explicitThankYouUrl) {
    return explicitThankYouUrl;
  }

  if (!origin || isLocalUrl(origin)) {
    return "";
  }

  return `${origin.replace(/\/$/, "")}/`;
};

const readJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? await response.json() : { message: await response.text() };
};

const findFirstString = (value, predicate) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return predicate(value) ? value : null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findFirstString(item, predicate);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findFirstString(item, predicate);

      if (found) {
        return found;
      }
    }
  }

  return null;
};

const isPixCopyPasteCode = (value) => typeof value === "string" && value.startsWith("000201");

const isImageLikeValue = (value) =>
  typeof value === "string" &&
  (value.startsWith("data:image/") ||
    (/^https?:\/\/.+/i.test(value) && /qr|qrcode|pix|image|png|jpg|jpeg/i.test(value)));

const extractPixPayload = (data) => {
  const pixCode = findFirstString(data, isPixCopyPasteCode);
  const base64Image = data?.pix?.base64;
  const qrCodeImage =
    typeof base64Image === "string" && base64Image.length > 100
      ? `data:image/png;base64,${base64Image}`
      : findFirstString(data, isImageLikeValue);

  return {
    pixCode,
    qrCodeImage,
    identifier: data?.identifier ?? data?.transactionId ?? data?.txid ?? data?.id ?? null,
    expiresAt: data?.expiresAt ?? data?.expirationDate ?? data?.pix?.expiresAt ?? data?.transaction?.expiresAt ?? null,
  };
};

export const createSigiloPayCheckout = async ({ product, contact, origin, env }) => {
  const publicKey = env.SIGILOPAY_PUBLIC_KEY;
  const secretKey = env.SIGILOPAY_SECRET_KEY;
  const sigiloApiBaseUrl = env.SIGILOPAY_BASE_URL ?? DEFAULT_SIGILO_API_BASE_URL;
  const checkoutPriceUnit = env.SIGILOPAY_CHECKOUT_PRICE_UNIT ?? "centavos";

  if (!publicKey || !secretKey) {
    return {
      status: 500,
      body: {
        message: "Configure SIGILOPAY_PUBLIC_KEY e SIGILOPAY_SECRET_KEY para habilitar o checkout.",
      },
    };
  }

  if (!product?.id || !product?.name || typeof product?.price !== "number") {
    return {
      status: 400,
      body: {
        message: "Produto invalido para criar o checkout.",
      },
    };
  }

  const customer = buildCustomer(contact);
  const thankYouPage = getThankYouPage(origin, env.SIGILOPAY_THANK_YOU_URL);

  if (!customer) {
    return {
      status: 400,
      body: {
        message: "Informe um WhatsApp ou email valido para continuar.",
      },
    };
  }

  const payload = {
    product: {
      externalId: product.id,
      name: product.name,
      photos: product.image ? [product.image] : undefined,
      offer: {
        name: product.name,
        price: normalizeCheckoutPrice(product.price, checkoutPriceUnit),
        offerType: "NATIONAL",
        currency: "all",
        lang: "pt-BR",
      },
    },
    settings: {
      paymentMethods: ["PIX"],
      acceptedDocs: ["CPF"],
      askForAddress: false,
      ...(thankYouPage ? { thankYouPage } : {}),
    },
    customer,
  };

  try {
    const response = await fetch(`${sigiloApiBaseUrl}/gateway/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      return {
        status: response.status,
        body: {
          message: data?.message ?? "Nao foi possivel criar o checkout na SigiloPay.",
          details: data,
        },
      };
    }

    if (!data?.checkoutUrl) {
      return {
        status: 502,
        body: {
          message: "A SigiloPay nao retornou uma URL de checkout.",
          details: data,
        },
      };
    }

    return {
      status: 200,
      body: {
        checkoutUrl: data.checkoutUrl,
      },
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        message: "Falha ao comunicar com a API da SigiloPay.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
    };
  }
};

export const createSigiloPayPixCharge = async ({ product, contact, customerName, document, email, env }) => {
  const publicKey = env.SIGILOPAY_PUBLIC_KEY;
  const secretKey = env.SIGILOPAY_SECRET_KEY;
  const sigiloApiBaseUrl = env.SIGILOPAY_BASE_URL ?? DEFAULT_SIGILO_API_BASE_URL;

  if (!publicKey || !secretKey) {
    return {
      status: 500,
      body: {
        message: "Configure SIGILOPAY_PUBLIC_KEY e SIGILOPAY_SECRET_KEY para habilitar o PIX direto.",
      },
    };
  }

  if (!product?.id || !product?.name || typeof product?.price !== "number") {
    return {
      status: 400,
      body: {
        message: "Produto invalido para criar a cobranca PIX.",
      },
    };
  }

  const client = buildPixClient(contact, customerName, document, email);

  if (!client) {
    return {
      status: 400,
      body: {
        message: "Informe um WhatsApp ou email valido para continuar.",
      },
    };
  }

  if (!client.document) {
    return {
      status: 400,
      body: {
        message: "Informe um CPF valido para gerar o PIX direto.",
      },
    };
  }

  if (!client.email) {
    return {
      status: 400,
      body: {
        message: "Informe um email valido para gerar o PIX direto.",
      },
    };
  }

  const payload = {
    identifier: `${product.id}-${Date.now()}`,
    amount: Number(product.price.toFixed(2)),
    client,
  };

  try {
    const response = await fetch(`${sigiloApiBaseUrl}/gateway/pix/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await readJsonResponse(response);

    if (!response.ok) {
      const permissionDenied =
        data?.errorCode === "GATEWAY_INVALID_ARGUMENT" &&
        typeof data?.message === "string" &&
        data.message.includes("Criar/Consultar Transações");

      return {
        status: response.status,
        body: {
          message: data?.message ?? "Nao foi possivel criar a cobranca PIX na SigiloPay.",
          details: data,
          permissionDenied,
        },
      };
    }

    const pixPayload = extractPixPayload(data);

    if (!pixPayload.pixCode) {
      return {
        status: 502,
        body: {
          message: "A SigiloPay nao retornou o PIX copia e cola esperado.",
          details: data,
        },
      };
    }

    return {
      status: 200,
      body: {
        ...pixPayload,
        raw: data,
      },
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        message: "Falha ao comunicar com a API PIX da SigiloPay.",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
    };
  }
};

export const buildOperationalEmail = ({ contact, customerName = "", domain = DEFAULT_OPERATION_EMAIL_DOMAIN, fallbackId = "" }) => {
  const trimmedContact = typeof contact === "string" ? contact.trim() : "";
  const trimmedDomain = typeof domain === "string" && domain.trim() ? domain.trim() : DEFAULT_OPERATION_EMAIL_DOMAIN;

  if (trimmedContact.includes("@")) {
    return trimmedContact;
  }

  const contactDigits = trimmedContact.replace(/\D/g, "");
  const localPart =
    normalizeEmailLocalPart(contactDigits) ||
    normalizeEmailLocalPart(customerName) ||
    normalizeEmailLocalPart(fallbackId) ||
    "cliente.site";

  return `${localPart}@${trimmedDomain}`;
};

export const createSigiloPaySitePayment = async ({
  product,
  contact,
  document,
  customerName = "Cliente Site",
  origin,
  env,
}) => {
  const randomCustomer = await getRandomCustomer(env);
  const resolvedCustomerName = randomCustomer.name || customerName;
  const resolvedDocument = document || randomCustomer.document;
  const resolvedPaymentContact = randomCustomer.phone;
  const resolvedEmail = randomCustomer.email || "";

  const operationalEmail = buildOperationalEmail({
    contact: resolvedEmail || resolvedPaymentContact,
    customerName: resolvedCustomerName,
    domain: env.SIGILOPAY_OPERATION_EMAIL_DOMAIN,
    fallbackId: product?.id,
  });

  const pixResult = await createSigiloPayPixCharge({
    product,
    contact: resolvedPaymentContact,
    customerName: resolvedCustomerName,
    document: resolvedDocument,
    email: resolvedEmail || operationalEmail,
    env,
  });

  if (pixResult.status === 200 && pixResult.body.pixCode) {
    return {
      status: 200,
      body: {
        mode: "pix",
        email: operationalEmail,
        ...pixResult.body,
      },
    };
  }

  const checkoutResult = await createSigiloPayCheckout({
    product,
    contact: resolvedEmail || resolvedPaymentContact,
    origin,
    env,
  });

  if (checkoutResult.status === 200 && checkoutResult.body.checkoutUrl) {
    return {
      status: 200,
      body: {
        mode: "checkout",
        email: operationalEmail,
        checkoutUrl: checkoutResult.body.checkoutUrl,
        deliveryContact: contact,
        message:
          pixResult.body?.permissionDenied
            ? "O PIX direto nao ficou disponivel para esta chave agora, entao enviamos o checkout seguro como alternativa."
            : `PIX direto indisponivel agora: ${pixResult.body?.message ?? "erro nao identificado"}.`,
      },
    };
  }

  return {
    status: pixResult.status >= 400 ? pixResult.status : checkoutResult.status,
    body: {
      message: pixResult.body?.message ?? checkoutResult.body?.message ?? "Nao foi possivel gerar o pagamento agora.",
      pixDetails: pixResult.body?.details,
      checkoutDetails: checkoutResult.body?.details,
    },
  };
};
