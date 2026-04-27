import { readFile } from "node:fs/promises";

const defaultCustomerDatabasePath = "./customers.json";

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
  const databasePath = env.CUSTOMER_DATABASE_PATH ?? defaultCustomerDatabasePath;
  const fileContent = await readFile(databasePath, "utf8");
  const parsed = JSON.parse(fileContent);
  const customers = Array.isArray(parsed) ? parsed : parsed.customers;

  if (!Array.isArray(customers)) {
    throw new Error("A base de clientes precisa ser um array ou conter a chave customers.");
  }

  const validCustomers = customers.map(normalizeCustomer).filter(isUsableCustomer);

  if (!validCustomers.length) {
    throw new Error("Nenhum cliente valido encontrado. Cada registro precisa ter phone/telefone e document/cpf.");
  }

  return validCustomers[Math.floor(Math.random() * validCustomers.length)];
};
