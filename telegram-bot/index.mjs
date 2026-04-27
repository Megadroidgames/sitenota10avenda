import "dotenv/config";
import { categories, products } from "../catalog/products.js";
import { createSigiloPayCheckout, createSigiloPayPixCharge } from "../sigilopay.js";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("Configure TELEGRAM_BOT_TOKEN no arquivo .env antes de iniciar o bot.");
}

const telegramApiBaseUrl = `https://api.telegram.org/bot${token}`;
const sessions = new Map();
let pollingOffset = 0;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const formatPrice = (price) =>
  price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const sanitizeDigits = (value) => String(value ?? "").replace(/\D/g, "");
const isLikelyCpf = (value) => sanitizeDigits(value).length === 11;
const defaultEmailDomain = process.env.TELEGRAM_OPERATION_EMAIL_DOMAIN ?? "unirecargabr.shops";

const normalizeEmailLocalPart = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");

const buildOperationalEmail = ({ telegramUser, chatId }) => {
  const baseLocalPart =
    normalizeEmailLocalPart(telegramUser?.username) ||
    normalizeEmailLocalPart([telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(".")) ||
    `cliente.${chatId}`;

  return `${baseLocalPart}@${defaultEmailDomain}`;
};

const getSession = (chatId) => {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, {
      lastCategory: "Todos",
      pendingProductId: null,
      pendingStep: null,
      pendingContact: null,
    });
  }

  return sessions.get(chatId);
};

const resetPendingSession = (session) => {
  session.pendingProductId = null;
  session.pendingStep = null;
  session.pendingContact = null;
};

const chunk = (items, size) => {
  const groups = [];

  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups;
};

const telegramRequest = async (method, payload = {}) => {
  const response = await fetch(`${telegramApiBaseUrl}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description ?? `Falha ao chamar ${method} no Telegram.`);
  }

  return data.result;
};

const telegramMultipartRequest = async (method, formData) => {
  const response = await fetch(`${telegramApiBaseUrl}/${method}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description ?? `Falha ao chamar ${method} no Telegram.`);
  }

  return data.result;
};

const categoryKeyboard = () => {
  const options = categories.map((category) => ({
    text: category,
    callback_data: `category:${category}`,
  }));

  return {
    inline_keyboard: chunk(options, 2),
  };
};

const productListKeyboard = (category) => {
  const filteredProducts = products.filter((product) => category === "Todos" || product.category === category);
  const rows = filteredProducts.map((product) => [
    {
      text: `${product.name} - ${formatPrice(product.price)}`,
      callback_data: `product:${product.id}`,
    },
  ]);

  rows.push([
    {
      text: "Voltar para categorias",
      callback_data: "menu:categories",
    },
  ]);

  return {
    inline_keyboard: rows,
  };
};

const productKeyboard = (product) => ({
  inline_keyboard: [
    [
      {
        text: "Comprar agora",
        callback_data: `buy:${product.id}`,
      },
    ],
    [
      {
        text: "Voltar para produtos",
        callback_data: `category:${product.category}`,
      },
      {
        text: "Categorias",
        callback_data: "menu:categories",
      },
    ],
  ],
});

const contactKeyboard = () => ({
  keyboard: [[{ text: "Enviar contato", request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
  input_field_placeholder: "Seu WhatsApp",
});

const removeKeyboard = () => ({
  remove_keyboard: true,
});

const welcomeText = () =>
  [
    "<b>You cine shops</b>",
    "",
    "Escolha uma categoria para ver os produtos e gerar seu pagamento.",
    "",
    "O bot tenta gerar PIX direto com QR Code e copia e cola. Se a sua conta ainda nao liberar esse modo, ele envia o checkout seguro como alternativa.",
  ].join("\n");

const categoryListText = (category) =>
  category === "Todos"
    ? "<b>Escolha um produto</b>\n\nVeja abaixo todas as recargas disponiveis."
    : `<b>${escapeHtml(category)}</b>\n\nEscolha um produto para continuar.`;

const productCaption = (product) => {
  const lines = [
    `<b>${escapeHtml(product.name)}</b>`,
    "",
    `Categoria: ${escapeHtml(product.category)}`,
    `Duracao: ${escapeHtml(product.duration)}`,
    `Preco: ${formatPrice(product.price)}`,
  ];

  if (product.originalPrice) {
    lines.push(`De: ${formatPrice(product.originalPrice)}`);
  }

  if (product.isCombo) {
    lines.push("Oferta: combo em destaque");
  }

  lines.push("", "Toque em comprar para gerar seu pagamento.");

  return lines.join("\n");
};

const sendCategories = async (chatId, messageId) => {
  const payload = {
    chat_id: chatId,
    text: welcomeText(),
    parse_mode: "HTML",
    reply_markup: categoryKeyboard(),
  };

  if (messageId) {
    payload.message_id = messageId;
    return telegramRequest("editMessageText", payload);
  }

  return telegramRequest("sendMessage", payload);
};

const sendProducts = async (chatId, category, messageId) => {
  const payload = {
    chat_id: chatId,
    text: categoryListText(category),
    parse_mode: "HTML",
    reply_markup: productListKeyboard(category),
  };

  if (messageId) {
    payload.message_id = messageId;
    return telegramRequest("editMessageText", payload);
  }

  return telegramRequest("sendMessage", payload);
};

const sendProductDetails = async (chatId, product) =>
  telegramRequest("sendPhoto", {
    chat_id: chatId,
    photo: product.image,
    caption: productCaption(product),
    parse_mode: "HTML",
    reply_markup: productKeyboard(product),
  });

const askForContact = async (chatId, product) =>
  telegramRequest("sendMessage", {
    chat_id: chatId,
    text: `Envie seu WhatsApp para gerar o pagamento de ${product.name}.`,
    reply_markup: contactKeyboard(),
  });

const askForCpf = async (chatId) =>
  telegramRequest("sendMessage", {
    chat_id: chatId,
    text: "Agora envie seu CPF para gerar o PIX direto.",
    reply_markup: removeKeyboard(),
  });

const sendCheckoutLink = async (chatId, product, checkoutUrl, reason = "") =>
  telegramRequest("sendMessage", {
    chat_id: chatId,
    text: [
      `<b>Link pronto para pagamento</b>`,
      "",
      `${escapeHtml(product.name)}`,
      `Valor: ${formatPrice(product.price)}`,
      reason ? "" : "",
      reason ? escapeHtml(reason) : "",
      "",
      "Toque no botao abaixo para abrir o checkout.",
    ]
      .filter(Boolean)
      .join("\n"),
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Pagar agora",
            url: checkoutUrl,
          },
        ],
        [
          {
            text: "Ver mais produtos",
            callback_data: "menu:categories",
          },
        ],
      ],
    },
  });

const sendPixCopyPaste = async (chatId, product, pixCode, expiresAt) =>
  telegramRequest("sendMessage", {
    chat_id: chatId,
    text: [
      `<b>PIX gerado com sucesso</b>`,
      "",
      `${escapeHtml(product.name)}`,
      `Valor: ${formatPrice(product.price)}`,
      expiresAt ? `Validade: ${escapeHtml(expiresAt)}` : "",
      "",
      "<b>PIX copia e cola</b>",
      `<code>${escapeHtml(pixCode)}</code>`,
      "",
      "Se preferir, use o QR Code enviado acima.",
    ]
      .filter(Boolean)
      .join("\n"),
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Ver mais produtos",
            callback_data: "menu:categories",
          },
        ],
      ],
    },
  });

const sendPixQrCode = async (chatId, product, qrCodeImage) =>
  (() => {
    const caption = [
      `<b>QR Code PIX</b>`,
      "",
      `${escapeHtml(product.name)}`,
      `Valor: ${formatPrice(product.price)}`,
    ].join("\n");

    if (typeof qrCodeImage === "string" && qrCodeImage.startsWith("data:image/")) {
      const [meta, base64] = qrCodeImage.split(",", 2);
      const mimeType = meta.match(/data:(.*);base64/)?.[1] ?? "image/png";
      const blob = new Blob([Buffer.from(base64, "base64")], { type: mimeType });
      const formData = new FormData();

      formData.append("chat_id", String(chatId));
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");
      formData.append("photo", blob, "pix-qrcode.png");

      return telegramMultipartRequest("sendPhoto", formData);
    }

    return telegramRequest("sendPhoto", {
      chat_id: chatId,
      photo: qrCodeImage,
      caption,
      parse_mode: "HTML",
    });
  })();

const clearPendingUi = async (chatId) =>
  telegramRequest("sendMessage", {
    chat_id: chatId,
    text: "Se preferir, voce tambem pode continuar escolhendo outros produtos.",
    reply_markup: removeKeyboard(),
  });

const setCommands = async () => {
  const commands = [
    { command: "start", description: "Abrir menu principal" },
    { command: "produtos", description: "Ver categorias e produtos" },
  ];

  await telegramRequest("setMyCommands", {
    commands,
  });
};

const processProductPayment = async ({ chatId, product, contact, customerName, document, email }) => {
  const pixResult = await createSigiloPayPixCharge({
    product,
    contact,
    customerName,
    document,
    email,
    env: process.env,
  });

  if (pixResult.status === 200 && pixResult.body.pixCode) {
    if (pixResult.body.qrCodeImage) {
      try {
        await sendPixQrCode(chatId, product, pixResult.body.qrCodeImage);
      } catch (error) {
        console.error("Falha ao enviar QR Code PIX no Telegram:", error);
      }
    }

    return sendPixCopyPaste(chatId, product, pixResult.body.pixCode, pixResult.body.expiresAt);
  }

  const checkoutResult = await createSigiloPayCheckout({
    product,
    contact,
    origin: process.env.PUBLIC_SITE_URL ?? "",
    env: process.env,
  });

  if (checkoutResult.status === 200 && checkoutResult.body.checkoutUrl) {
    const fallbackReason = pixResult.body?.permissionDenied
      ? "A conta da SigiloPay ainda nao liberou o PIX direto para esta chave, entao enviei o checkout seguro como plano B."
      : `PIX direto indisponivel agora: ${pixResult.body?.message ?? "erro nao identificado"}.`;

    return sendCheckoutLink(chatId, product, checkoutResult.body.checkoutUrl, fallbackReason);
  }

  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text: pixResult.body?.message ?? checkoutResult.body?.message ?? "Nao foi possivel gerar o pagamento agora.",
  });
};

const handleCommand = async (message) => {
  const chatId = message.chat.id;
  const session = getSession(chatId);
  const text = message.text?.trim() ?? "";

  if (text === "/start" || text === "/produtos") {
    resetPendingSession(session);
    return sendCategories(chatId);
  }

  if (text.startsWith("/")) {
    return telegramRequest("sendMessage", {
      chat_id: chatId,
      text: "Use /start para abrir o menu de vendas.",
    });
  }

  if (!session.pendingProductId || !session.pendingStep) {
    return telegramRequest("sendMessage", {
      chat_id: chatId,
      text: "Use /start para escolher um produto.",
    });
  }

  const product = products.find((item) => item.id === session.pendingProductId);

  if (!product) {
    resetPendingSession(session);
    return telegramRequest("sendMessage", {
      chat_id: chatId,
      text: "Nao encontrei o produto selecionado. Use /start e tente novamente.",
      reply_markup: removeKeyboard(),
    });
  }

  if (session.pendingStep === "contact") {
    const contact = message.contact?.phone_number ?? text;

    if (!contact) {
      return telegramRequest("sendMessage", {
        chat_id: chatId,
        text: "Envie um WhatsApp valido para continuar.",
      });
    }

    session.pendingContact = contact;
    session.pendingStep = "cpf";
    return askForCpf(chatId);
  }

  if (session.pendingStep === "cpf") {
    const document = sanitizeDigits(text);

    if (!isLikelyCpf(document)) {
      return telegramRequest("sendMessage", {
        chat_id: chatId,
        text: "Envie um CPF valido com 11 numeros para continuar.",
      });
    }

    const contact = session.pendingContact;
    const customerName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Cliente Telegram";
    const email = buildOperationalEmail({
      telegramUser: message.from,
      chatId,
    });

    resetPendingSession(session);
    await clearPendingUi(chatId);

    return processProductPayment({
      chatId,
      product,
      contact,
      customerName,
      document,
      email,
    });
  }
};

const handleCallback = async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data ?? "";

  if (!chatId || !messageId) {
    return;
  }

  const session = getSession(chatId);

  await telegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQuery.id,
  });

  if (data === "menu:categories") {
    resetPendingSession(session);
    return sendCategories(chatId, messageId);
  }

  if (data.startsWith("category:")) {
    const category = data.slice("category:".length);
    session.lastCategory = category;
    return sendProducts(chatId, category, messageId);
  }

  if (data.startsWith("product:")) {
    const productId = data.slice("product:".length);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return telegramRequest("sendMessage", {
        chat_id: chatId,
        text: "Produto nao encontrado.",
      });
    }

    return sendProductDetails(chatId, product);
  }

  if (data.startsWith("buy:")) {
    const productId = data.slice("buy:".length);
    const product = products.find((item) => item.id === productId);

    if (!product) {
      return telegramRequest("sendMessage", {
        chat_id: chatId,
        text: "Produto nao encontrado.",
      });
    }

    session.pendingProductId = product.id;
    session.pendingStep = "contact";
    session.pendingContact = null;
    return askForContact(chatId, product);
  }
};

const processUpdate = async (update) => {
  if (update.callback_query) {
    return handleCallback(update.callback_query);
  }

  if (update.message) {
    return handleCommand(update.message);
  }
};

const pollUpdates = async () => {
  while (true) {
    try {
      const updates = await telegramRequest("getUpdates", {
        offset: pollingOffset,
        timeout: 30,
        allowed_updates: ["message", "callback_query"],
      });

      for (const update of updates) {
        pollingOffset = update.update_id + 1;
        await processUpdate(update);
      }
    } catch (error) {
      console.error("Falha no polling do Telegram:", error);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

await setCommands();
console.log("Bot do Telegram iniciado.");
await pollUpdates();
