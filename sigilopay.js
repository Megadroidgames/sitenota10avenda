const DEFAULT_SIGILO_API_BASE_URL = "https://app.sigilopay.com.br/api/v1";

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

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

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
