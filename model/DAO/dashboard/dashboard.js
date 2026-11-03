const knex = require("knex")
const knexDatabaseConfig = require("../../database_config/knex.config.js")

const knexConnection = knex(knexDatabaseConfig.development)

const selectResumo = async function () {
    try {
        const sql = `select
                count(*) as quantidade_produtos,
                coalesce(sum(case when produto.is_ativo = true then 1 else 0 end), 0) as produtos_ativos,
                coalesce(sum(coalesce(estoque.saldo, 0)), 0) as unidades_em_estoque,
                coalesce(sum(case
                    when coalesce(estoque.saldo, 0) <= produto.estoque_minimo then 1
                    else 0
                end), 0) as produtos_estoque_baixo,
                coalesce(sum(
                    coalesce(estoque.saldo, 0) * produto.preco_unitario
                ), 0) as valor_estimado_estoque,
                (select count(*) from tbl_venda) as quantidade_vendas,
                (select coalesce(sum(valor_total), 0) from tbl_venda) as valor_total_vendido
            from tbl_produto as produto
            left join (
                    select id_produto,
                        sum(case
                            when id_tipo_movimentacao = 1 then quantidade
                            when id_tipo_movimentacao = 2 then -quantidade
                            else 0
                        end) as saldo
                    from tbl_movimentacao
                    group by id_produto
                ) as estoque on estoque.id_produto = produto.id`
        const result = await knexConnection.raw(sql)

        return Array.isArray(result) ? result[0][0] : false
    } catch (error) {
        console.error(error)
        return false
    }
}

const selectMaisVendidos = async function () {
    try {
        const sql = `select
                produto.id as id_produto,
                produto.nome as nome_produto,
                sum(item.quantidade) as quantidade_vendida,
                sum(item.quantidade * item.preco_unitario) as valor_total_vendido
            from tbl_item_venda as item
            inner join tbl_produto as produto on produto.id = item.id_produto
            group by produto.id, produto.nome
            order by quantidade_vendida desc, produto.nome
            limit 5`
        const result = await knexConnection.raw(sql)

        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = {
    selectResumo,
    selectMaisVendidos
}
