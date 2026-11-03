# Caminho das rotas — Estoque+

Este arquivo organiza a implementação da API por fases. A ordem sugerida considera as dependências entre produtos, movimentações e vendas.

## Prefixo sugerido

Use `/v1/estoque` como prefixo da API. Por exemplo: `GET /v1/estoque/categorias`.

No estado atual, a rota de categorias está montada em `/v1/estoque/categoria` (singular), e atende `GET /`. Ao implementar este guia, alinhe o caminho para `/v1/estoque/categorias` ou mantenha o caminho atual conscientemente.

## Fase 1 — Base

1. `GET /categorias`
   - Listar as categorias cadastradas.
2. `POST /produtos`
   - Cadastrar produto com nome, descrição, preço, estoque mínimo e categoria.
   - Validar os campos obrigatórios e se a categoria existe.
3. `GET /produtos`
   - Listar produtos, inicialmente sem saldo de estoque.
4. `GET /produtos/:id`
   - Consultar um produto pelo identificador.
   - Retornar não encontrado quando o ID não existir.

## Fase 2 — Estoque

5. `GET /movimentacoes/tipos`
   - Listar os tipos de movimentação disponíveis (Entrada ou Saída).
6. `POST /movimentacoes`
   - Registrar uma entrada ou saída de estoque.
   - Validar produto, tipo de movimentação e quantidade.
   - Receber `id_produto`, `id_tipo_movimentacao`, `quantidade` e `observacao` (opcional).
   - Para saídas, validar que há saldo suficiente antes de gravar.
   - Implementar a validação de saldo como função separada para reutilizá-la nas vendas.
7. Atualizar `GET /produtos`
   - Incluir o saldo atual, calculado pelas movimentações de entrada menos as de saída.
   - Incluir a situação do estoque, por exemplo: abaixo do mínimo ou normal.

## Fase 3 — Venda

8. `POST /vendas`
   - Registrar uma venda com um ou mais itens.
   - Receber `itens` como uma lista de objetos com `id_produto` e `quantidade`.
   - Calcular o valor total usando o preço atual de cada produto.
   - Usar uma transação para gravar venda, itens e movimentações de saída juntos.
   - Reaproveitar a validação de saldo criada na fase 2.
   - Se algum item falhar, desfazer toda a transação.
9. `GET /vendas/:id`
   - Consultar uma venda pelo ID, incluindo seus itens.
   - Implementado em `GET /v1/estoque/vendas/:id`.
10. `GET /vendas`
    - Listar vendas, com filtros opcionais por período (`data_inicio` e `data_fim`).
    - Implementado em `GET /v1/estoque/vendas`.


<!-- parei aqui -->

## Fase 4 — Completar produtos e histórico

11. `PUT /produtos/:id`
    - Atualizar os dados do produto e validar os campos e a categoria.
    - Implementado em `PUT /v1/estoque/produto/:id`. Envie `nome`, `descricao` (opcional), `preco_unitario`, `estoque_minimo` e `id_categoria` no corpo JSON.
12. `PATCH /produtos/:id/ativo`
    - Ativar ou desativar o produto sem apagar seus registros históricos.
    - Implementado em `PATCH /v1/estoque/produto/:id/ativo`. Envie `{"is_ativo": true}` para ativar ou `{"is_ativo": false}` para inativar.
13. `DELETE /produtos/:id`
    - Excluir somente se não houver movimentações ou itens de venda relacionados.
    - Se houver histórico, responder com erro explicando que o produto não pode ser removido.
    - Implementado em `DELETE /v1/estoque/produto/:id`.
14. `GET /movimentacoes`
    - Consultar o histórico de movimentações.
    - Implementado em `GET /v1/estoque/movimentacoes`. Filtros opcionais: `id_produto`, `id_tipo_movimentacao`, `data_inicio` e `data_fim` (datas no formato `AAAA-MM-DD`).

## Fase 5 — Relatórios e visão geral

15. `GET /vendas/relatorio`
    - Retorna período, faturamento, itens vendidos, quantidade de produtos distintos vendidos e total por produto; aceita filtros opcionais (`data_inicio` e `data_fim`).
    - Implementado em `GET /v1/estoque/vendas/relatorio`.
16. `GET /dashboard/resumo`
    - Retorna total de produtos cadastrados e ativos, unidades em estoque, produtos no mínimo ou abaixo dele, valor estimado do estoque, quantidade de vendas e valor total vendido.
    - Implementado em `GET /v1/estoque/dashboard/resumo`.
17. `GET /dashboard/mais-vendidos`
    - Retorna os 5 produtos mais vendidos de todos os períodos, ordenados pela quantidade vendida.
    - Implementado em `GET /v1/estoque/dashboard/mais-vendidos`.
18. `GET /dashboard/movimentos`
    - Retorna as quantidades totais de entradas e saídas e a divisão por dia nos últimos 14 dias.
    - Implementado em `GET /v1/estoque/dashboard/movimentos`.

## Ordem de implementação

Conclua e teste cada fase antes de avançar. As funções de cálculo de saldo e validação de saída devem ser compartilhadas entre as rotas de movimentação e venda, para evitar regras divergentes. Nas operações que gravam vários registros relacionados, use transações do banco.
