const knex = require("knex")
const knexDatabaseConfig = require("../../database_config/knex.config.js")

const knexConnection = knex(knexDatabaseConfig.development)

const selectAllProdutos = async function () {
    try {
        let sql = `select
            produto.*,
            coalesce(movimentacao.estoque_atual, 0) as estoque_atual
        from tbl_produto as produto
        left join (
            select
                id_produto,
                sum(case
                    when id_tipo_movimentacao = 1 then quantidade
                    when id_tipo_movimentacao = 2 then -quantidade
                    else 0
                end) as estoque_atual
            from tbl_movimentacao
            group by id_produto
        ) as movimentacao on movimentacao.id_produto = produto.id`

        let result = await knexConnection.raw(sql)

        if (Array.isArray(result)) {
            return result[0]
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const insertProduto = async function (produto) {

    try {
    let sql = `insert into tbl_produto (
    nome,
    descricao,
    preco_unitario,
    estoque_minimo,
    id_categoria
) values (
    ?,
    ?,
    ?,
    ?,
    ?
);`
    let result = await knexConnection.raw(sql, [
        produto.nome,
        produto.descricao,
        produto.preco_unitario,
        produto.estoque_minimo,
        produto.id_categoria
    ])

    if(result)    
        return result[0].insertId
    else    
        return false

}
    catch (error) {
        console.log(error)
        return false
    }
}

const selectByIdProduto = async function (id) {
    try {
        let sql = `select * from tbl_produto where id = ?`
        let result = await knexConnection.raw(sql, [id])

        if (Array.isArray(result)) {
            return result[0]
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateProduto = async function (id, produto) {
    try {
        const existingProduto = await selectByIdProduto(id)
        if (existingProduto === false) {
            return false
        }
        if (existingProduto.length === 0) {
            return null
        }

        const sql = `update tbl_produto
            set nome = ?,
                descricao = ?,
                preco_unitario = ?,
                estoque_minimo = ?,
                id_categoria = ?
            where id = ?`
        const result = await knexConnection.raw(sql, [
            produto.nome,
            produto.descricao ?? null,
            Number(produto.preco_unitario),
            Number(produto.estoque_minimo),
            Number(produto.id_categoria),
            id
        ])

        return Array.isArray(result) ? true : false
    } catch (error) {
        console.error(error)
        return false
    }
}

const updateStatusProduto = async function (id, isAtivo) {
    try {
        const existingProduto = await selectByIdProduto(id)
        if (existingProduto === false) {
            return false
        }
        if (existingProduto.length === 0) {
            return null
        }

        const sql = `update tbl_produto set is_ativo = ? where id = ?`
        const result = await knexConnection.raw(sql, [isAtivo, id])

        return Array.isArray(result) ? true : false
    } catch (error) {
        console.error(error)
        return false
    }
}

const deleteProduto = async function (id) {
    try {
        const produto = await selectByIdProduto(id)
        if (produto === false) {
            return false
        }
        if (produto.length === 0) {
            return "not_found"
        }

        const movimentacoesSql = `select id from tbl_movimentacao where id_produto = ? limit 1`
        const movimentacoes = await knexConnection.raw(movimentacoesSql, [id])
        if (!Array.isArray(movimentacoes)) {
            return false
        }
        if (movimentacoes[0].length > 0) {
            return "has_history"
        }

        const vendasSql = `select id from tbl_item_venda where id_produto = ? limit 1`
        const vendas = await knexConnection.raw(vendasSql, [id])
        if (!Array.isArray(vendas)) {
            return false
        }
        if (vendas[0].length > 0) {
            return "has_history"
        }

        const deleteSql = `delete from tbl_produto where id = ?`
        const result = await knexConnection.raw(deleteSql, [id])
        return Array.isArray(result) ? true : false
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = {
    selectAllProdutos,
    insertProduto,
    selectByIdProduto,
    updateProduto,
    updateStatusProduto,
    deleteProduto
}