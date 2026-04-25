# You cine shops

Este projeto foi ajustado para:

- usar a marca `You cine shops`
- trocar o PIX estatico por checkout da SigiloPay via API
- funcionar localmente com `server.js`
- ficar pronto para deploy na Netlify com `netlify/functions`

## Como rodar localmente

1. Instale as dependencias:

```sh
npm install
```

2. Crie seu arquivo `.env` com base no `.env.example`.

3. Preencha pelo menos estas variaveis:

```env
SIGILOPAY_PUBLIC_KEY=
SIGILOPAY_SECRET_KEY=
```

4. Rode em desenvolvimento:

```sh
npm run dev
```

O projeto abre em `http://localhost:3000`.

## Variaveis de ambiente

- `SIGILOPAY_PUBLIC_KEY`: chave publica da API
- `SIGILOPAY_SECRET_KEY`: chave secreta da API
- `SIGILOPAY_BASE_URL`: base da API da SigiloPay
- `SIGILOPAY_CHECKOUT_PRICE_UNIT`: use `reais` ou `centavos`
- `SIGILOPAY_THANK_YOU_URL`: URL publica opcional para retorno apos a compra
- `PORT`: porta local do servidor Node

## Fluxo atual

- o front coleta WhatsApp ou email
- a API cria um checkout em `POST /gateway/checkout`
- o cliente e redirecionado para a pagina segura da SigiloPay

## Estrutura para Netlify

Arquivos preparados:

- `netlify.toml`
- `netlify/functions/sigilopay-checkout.mjs`
- `sigilopay.js`

Na Netlify, a rota usada pelo frontend continua sendo:

```txt
/api/sigilopay/checkout
```

## Como publicar na Netlify

1. Suba este projeto para um repositorio no GitHub.
2. Na Netlify, clique em `Add new site`.
3. Escolha `Import an existing project`.
4. Conecte o repositorio.
5. Confirme estas configuracoes:

```txt
Build command: npm run build
Publish directory: dist
```

6. Em `Site configuration` > `Environment variables`, crie:

```txt
SIGILOPAY_PUBLIC_KEY
SIGILOPAY_SECRET_KEY
SIGILOPAY_BASE_URL
SIGILOPAY_CHECKOUT_PRICE_UNIT
SIGILOPAY_THANK_YOU_URL
```

7. Salve e faca o deploy.

## Importante

- Nao coloque as chaves da SigiloPay no frontend.
- Coloque as chaves apenas nas variaveis da Netlify.
- Se quiser pagina de retorno apos compra, `SIGILOPAY_THANK_YOU_URL` precisa ser uma URL publica real, nao `localhost`.
- O exemplo deste projeto esta configurado com `SIGILOPAY_CHECKOUT_PRICE_UNIT=reais`.

## Build de producao local

```sh
npm run build
npm run preview
```
