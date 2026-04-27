import { readFile } from "node:fs/promises";

const defaultCustomerDatabasePaths = ["./customers.json", "./telegram-bot/customers.json"];

const sanitizeDigits = (value) => String(value ?? "").replace(/\D/g, "");

const normalizeCustomer = (customer) => {
  const phone = sanitizeDigits(customer?.phone ?? customer?.telefone ?? customer?.whatsapp);
  const document = sanitizeDigits(customer?.document ?? customer?.cpf);
  const name = String(customer?.name ?? customer?.nome ?? "Cliente autorizado").trim() || "Cliente autorizado";
  const email = String(customer?.email ?? "").trim();

  return {
    name,
    phone,
    document,
    email,
  };
};

const isUsableCustomer = (customer) => customer.phone.length >= 10 && customer.document.length === 11;

export const getRandomCustomer = async (env = process.env) => {
  const candidatePaths = env.CUSTOMER_DATABASE_PATH
    ? [env.CUSTOMER_DATABASE_PATH, ...defaultCustomerDatabasePaths]
    : defaultCustomerDatabasePaths;

  let fileContent = "";
  let loadedPath = "";

  for (const databasePath of candidatePaths) {
    try {
      fileContent = await readFile(databasePath, "utf8");
      loadedPath = databasePath;
      break;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  if (!fileContent) {
    throw new Error(
      `Nao foi possivel localizar a base de clientes. Caminhos tentados: ${candidatePaths.join(", ")}`,
    );
  }

  const parsed = JSON.parse(fileContent);
  const customers = Array.isArray(parsed) ? parsed : parsed.customers;

  if (!Array.isArray(customers)) {
    throw new Error(`A base de clientes em ${loadedPath} precisa ser um array ou conter a chave customers.`);
  }

  const validCustomers = customers.map(normalizeCustomer).filter(isUsableCustomer);

  if (!validCustomers.length) {
    throw new Error("Nenhum cliente valido encontrado. Cada registro precisa ter phone/telefone e document/cpf.");
  }

  return validCustomers[Math.floor(Math.random() * validCustomers.length)];
};
