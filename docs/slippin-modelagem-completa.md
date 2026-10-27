# Slippin — Modelagem de Dados Completa

Referência para você escrever o `schema.prisma` e o seu `data-model.md`.
Sem código: só entidades, campos, relações e o porquê de cada decisão.

**Atualização:** `cpf` removido do `User`. O CPF existe só em `Order.buyerCpf`.

Itens marcados com **[PROPOSTA]** são escolhas minhas. Confirme ou mude, e registre no seu `decisions.md`.

---

## Regras gerais

- **Dinheiro:** inteiro em centavos (`4500` = R$ 45,00). Nunca float.
- **CPF:** guardar só os 11 dígitos, sem pontos e traço.
- **Nomes:** camelCase em todo o schema.
- **`?`** = opcional (pode ser nulo).
- **Relação:** o lado "N" guarda a chave estrangeira. Toda relação tem dois lados no Prisma (a chave e o campo navegável).
- **Tudo que muda depois e não pode alterar o passado vira snapshot** (ex: preço pago no pedido).

---

## Enums

| Enum | Valores |
|------|---------|
| `Role` | `USER`, `ADMIN` |
| `SellerStatus` | `NONE`, `PENDING`, `APPROVED`, `REJECTED` |
| `OnboardingStatus` | `PENDING`, `COMPLETE` |
| `EventType` | `CASUAL`, `PROFESSIONAL` |
| `Visibility` | `PUBLIC`, `PRIVATE` |
| `OrderStatus` | `PENDING`, `PAID`, `CANCELLED` |
| `TicketStatus` | `VALID`, `USED` |

---

## 1. User

**O que é:** a conta de uma pessoa. A mesma conta compra e organiza.

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `name` | String | |
| `email` | String | Único |
| `passwordHash` | String | Nunca senha pura |
| `role` | Role | Padrão `USER` |
| `sellerStatus` | SellerStatus | Padrão `NONE`. Quem decide é o admin |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |
| `deletedAt` | DateTime? | Soft delete |

**Relações:** 0 ou 1 `SellerProfile`; vários `Event` (organizador); vários `Order` (como comprador logado).

---

## 2. SellerProfile

**O que é:** dados de recebedor no gateway (KYC).

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `userId` | String | FK para `User`. **Único** (garante o 1 para 1) |
| `recipientId` | String? | Só existe depois do onboarding |
| `status` | OnboardingStatus | Padrão `PENDING`. Situação no **gateway** |

**Relação com `User`:** 1 para 1.

---

## 3. Event

**O que é:** evento criado por um organizador.

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `organizerId` | String | FK para `User` |
| `title` | String | |
| `description` | String? | |
| `eventType` | EventType | |
| `visibility` | Visibility | Padrão `PUBLIC` |
| `slug` | String | Único. Não muda depois de criado |
| `city` | String | Filtro da listagem |
| `location` | String | |
| `startsAt` | DateTime | |
| `endsAt` | DateTime? | |
| `createdAt` | DateTime | |

**Relações:** pertence a 1 `User`; tem vários `TicketType`; tem vários `Order`.

---

## 4. TicketType

**O que é:** o que está à venda no evento (ex: "Meia-entrada R$ 20").

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `eventId` | String | FK para `Event` |
| `name` | String | |
| `description` | String? | |
| `price` | Int | Centavos |
| `quantityTotal` | Int | Total criado pelo organizador **[PROPOSTA]** |
| `quantityAvailable` | Int | O que ainda pode ser vendido **[PROPOSTA]** |
| `cpfLimit` | Int? | `null` = sem limite |

**Relações:** pertence a 1 `Event`; tem vários `OrderItem`.

**Por que dois campos de quantidade [PROPOSTA]:**
- `quantityAvailable` é o que você decrementa dentro de uma **transaction** na criação do pedido. Isso evita vender mais do que existe.
- `quantityTotal` permite mostrar "vendidos" no dashboard (total menos disponível) sem contar nada.
- Derivar o estoque só a partir de `Ticket` não funciona: o `Ticket` só nasce depois do pagamento, então pedidos pendentes não seriam contados e você venderia demais.

---

## 5. Order

**O que é:** o pedido de um comprador, logado ou guest, para **um** evento.

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `userId` | String? | FK para `User`. **Opcional** (guest não tem conta) |
| `eventId` | String | FK para `Event` **[PROPOSTA]** |
| `buyerName` | String | Obrigatório, mesmo logado |
| `buyerEmail` | String | Obrigatório, mesmo logado |
| `buyerCpf` | String | Obrigatório, mesmo logado |
| `status` | OrderStatus | Padrão `PENDING` |
| `totalAmount` | Int | Centavos |
| `platformFee` | Int | Comissão do Slippin, centavos |
| `sellerAmount` | Int | Parte do organizador, centavos |
| `paymentId` | String? | Id da cobrança no gateway. Opcional até criar o pagamento |
| `createdAt` | DateTime | |
| `paidAt` | DateTime? | Preenchido quando vira `PAID` |

**Relações:** pertence a 1 `Event`; pertence opcionalmente a 1 `User`; tem vários `OrderItem`.

**Decisões e porquês:**
- **`buyerName/Email/Cpf` sempre preenchidos, até para usuário logado.** Assim existe um só caminho de código para guest e logado, e o pedido é um registro fixo do que foi informado na compra.
- **`eventId` no pedido [PROPOSTA]:** dá para chegar no evento passando pelos itens, mas "quem já pagou neste evento" é consulta frequente do dashboard. Regra de negócio que isso exige: **um pedido tem itens de um evento só**.
- **`platformFee` e `sellerAmount` guardados:** a comissão pode mudar no futuro (admin configura). O pedido guarda o que valeu na hora, como snapshot.
- **`totalAmount` pode ser derivado** (soma dos itens), mas guardar facilita conferir com o gateway.

---

## 6. OrderItem

**O que é:** uma linha do pedido (ex: "2x Meia-entrada").

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `orderId` | String | FK para `Order` |
| `ticketTypeId` | String | FK para `TicketType` |
| `quantity` | Int | Quantos ingressos dessa linha |
| `unitPrice` | Int | **Snapshot** do preço na hora da compra, centavos |

**Relações:** pertence a 1 `Order`; pertence a 1 `TicketType`; tem vários `Ticket`.

**Por que `unitPrice`:** se o organizador mudar o preço do `TicketType` depois, o pedido antigo não pode mudar junto.
**Subtotal não é guardado:** é `quantity × unitPrice`, calculável.

---

## 7. Ticket

**O que é:** um ingresso individual, gerado **somente após o pagamento**.

| Campo | Tipo | Observações |
|-------|------|-------------|
| `id` | String (uuid) | Chave primária |
| `orderItemId` | String | FK para `OrderItem` |
| `code` | String | **Único**. Ex: `SLP-8F3K2A` |
| `status` | TicketStatus | Padrão `VALID` |
| `usedAt` | DateTime? | Preenchido no check-in |
| `createdAt` | DateTime | |

**Relações:** pertence a 1 `OrderItem`.

**Decisões e porquês:**
- **Um `OrderItem` com `quantity` 3 gera 3 `Ticket`.** Cada pessoa precisa do seu código para entrar.
- **O QR Code não vai no banco.** Ele é gerado a partir do `code`, ou seja, é derivável (pergunta 3 do método).
- **Para achar o evento de um ticket:** `Ticket → OrderItem → TicketType → Event`. Funciona sem campo extra. Se o check-in ficar lento, aí sim se considera guardar `eventId` no ticket.

---

## Mapa de relações

| De | Para | Tipo |
|----|------|------|
| `User` | `SellerProfile` | 1 para 0..1 |
| `User` | `Event` | 1 para N |
| `User` | `Order` | 1 para N (opcional no lado do pedido) |
| `Event` | `TicketType` | 1 para N |
| `Event` | `Order` | 1 para N |
| `Order` | `OrderItem` | 1 para N |
| `TicketType` | `OrderItem` | 1 para N |
| `OrderItem` | `Ticket` | 1 para N |

Cadeia principal: `Event → TicketType → OrderItem → Ticket`, com `Order` agrupando os itens.

---

## Como o limite por CPF funciona com guest

O `User` **não tem CPF** (decisão sua: fora do MVP). O CPF só existe no pedido, e é o `Order.buyerCpf` que garante a regra, para guest e para logado. Consequência: quem está logado digita o CPF no checkout a cada compra.

Antes de criar o pedido, para cada item:

1. Some o `quantity` dos `OrderItem` do mesmo `ticketTypeId`, onde `Order.buyerCpf` é igual ao CPF informado e `Order.status` é `PENDING` ou `PAID`.
2. Some a quantidade que está sendo comprada agora.
3. Se passar do `cpfLimit`, recuse.

`PENDING` entra na conta para impedir que a pessoa abra vários pedidos pendentes e fure o limite. `CANCELLED` não conta.

---

## Regras que a modelagem pressupõe

- Um pedido contém itens de **um evento só**.
- A criação do pedido, a checagem de limite e o decremento de `quantityAvailable` acontecem **na mesma transaction**.
- Ao cancelar um pedido, `quantityAvailable` volta (soma a quantidade dos itens).
- Webhook do gateway pode chegar **duas vezes**: antes de gerar tickets, confira se o pedido já está `PAID`. Senão você gera ingressos duplicados.
- Ticket só é criado quando o pedido vira `PAID`.
- Check-in: `VALID` vira `USED` e preenche `usedAt`. Ticket `USED` não valida de novo.

---

## Índices a considerar

| Onde | Para quê |
|------|----------|
| `Event.slug` (único) | Buscar pelo link |
| `Event` por `visibility`, `city`, `startsAt` | Listagem e filtros da home |
| `Order.buyerCpf` | Checagem do limite por CPF |
| `Order.eventId` | Dashboard "quem já pagou" |
| `Order.paymentId` | Achar o pedido quando o webhook chega |
| `Ticket.code` (único) | Check-in por código |

---

## Pendências para o seu `decisions.md`

- [ ] Estoque: dois campos (`quantityTotal` e `quantityAvailable`) ou outra abordagem?
- [ ] `eventId` direto no `Order` ou só via itens?
- [ ] Pedidos `PENDING` que nunca pagam: quanto tempo até cancelar e devolver o estoque? (A "reserva temporária" está fora do MVP, mas pedidos abandonados ainda seguram estoque.)
- [ ] O que acontece com pedidos de guest quando a pessoa cria conta depois? (Como o `User` não tem CPF, a ligação só pode ser por e-mail: o `buyerEmail` do pedido igual ao e-mail da conta nova.)

---

## Checklist para escrever o schema

- [ ] 7 enums
- [ ] 7 models: `User`, `SellerProfile`, `Event`, `TicketType`, `Order`, `OrderItem`, `Ticket`
- [ ] Dois lados de cada relação
- [ ] `userId` opcional em `Order`
- [ ] Campos opcionais com `?` e únicos nos lugares certos
- [ ] Índices da tabela acima
- [ ] `prisma format` e `prisma migrate dev` para validar
