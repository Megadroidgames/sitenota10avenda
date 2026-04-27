# Bot de vendas no Telegram

Este bot usa:

- o mesmo catalogo do site
- a mesma integracao com a SigiloPay
- PIX direto quando a conta tiver permissao liberada
- checkout hospedado como fallback quando o PIX direto nao estiver disponivel

## Variaveis necessarias

No `.env`, configure:

```env
TELEGRAM_BOT_TOKEN=
SIGILOPAY_PUBLIC_KEY=
SIGILOPAY_SECRET_KEY=
SIGILOPAY_BASE_URL=https://app.sigilopay.com.br/api/v1
SIGILOPAY_CHECKOUT_PRICE_UNIT=reais
SIGILOPAY_THANK_YOU_URL=
PUBLIC_SITE_URL=
```

## Como iniciar

```sh
npm run bot:telegram
```

## Fluxo do bot

1. usuario abre `/start`
2. escolhe a categoria
3. escolhe o produto
4. toca em comprar
5. envia WhatsApp ou email
6. envia CPF
7. o bot tenta gerar o PIX direto
8. se a conta da SigiloPay permitir, envia QR Code e copia e cola no Telegram
9. se a conta ainda nao permitir, envia o checkout hospedado da SigiloPay

## Permissao da SigiloPay

Para o bot entregar QR Code e PIX copia e cola direto no Telegram, a chave usada precisa ter a permissao:

`Criar/Consultar Transações`

Se essa permissao ainda nao estiver ativa, o bot continua funcionando com fallback para o checkout.
