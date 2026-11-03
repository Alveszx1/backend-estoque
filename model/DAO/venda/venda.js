const knex = require("knex")
const knexDatabaseConfig = require("../../database_config/knex.config.js")

const knexConnection = knex(knexDatabaseConfig.development)

const selectProdutoForVenda = async function (idProduto, db = knexConnection) {
    try {
        let sql = `select id, preco_unitario
            from tbl_produto
            where id = ?
            for update`
        let result = await db.raw(sql, [idProduto])

        if (Array.isArray(result)) {
            return result[0][0] || null
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const insertVenda = async function (valorTotal, db = knexConnection) {
    try {
        let sql = `insert into tbl_venda (data_venda, valor_total)
            values (now(), ?)`
        let result = await db.raw(sql, [valorTotal])

        if (Array.isArray(result)) {
            return result[0].insertId
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const insertItemVenda = async function (item, db = knexConnection) {
    try {
        let sql = `insert into tbl_item_venda
            (quantidade, preco_unitario, id_venda, id_produto)
            values (?, ?, ?, ?)`
        let result = await db.raw(sql, [
            item.quantidade,
            item.preco_unitario,
            item.id_venda,
            item.id_produto
        ])

        return Array.isArray(result) ? result[0].insertId : false
    } catch (error) {
        console.log(error)
        return false
    }
}

const selectVendaById = async function (idVenda) {
    try {
        let sql = `select
                venda.id,
                venda.data_venda,
                venda.valor_total,
                item.id as id_item,
                item.id_produto,
                produto.nome as nome_produto,
                item.quantidade,
                item.preco_unitario
            from tbl_venda as venda
            left join tbl_item_venda as item on item.id_venda = venda.id
            left join tbl_produto as produto on produto.id = item.id_produto
            where venda.id = ?
            order by item.id`
        let result = await knexConnection.raw(sql, [idVenda])

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

const selectAllVendas = async function (dataInicio, dataFim) {
    try {
        let sql = `select id, data_venda, valor_total
            from tbl_venda`
        let params = []
        let conditions = []

        if (dataInicio) {
            conditions.push("data_venda >= ?")
            params.push(dataInicio)
        }
        if (dataFim) {
            conditions.push("data_venda < date_add(?, interval 1 day)")
            params.push(dataFim)
        }
        if (conditions.length > 0) {
            sql += ` where ${conditions.join(" and ")}`
        }
        sql += " order by data_venda desc, id desc"

        let result = await knexConnection.raw(sql, params)

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

const selectRelatorioVendas = async function (dataInicio, dataFim) {
    try {
        let condicoes = []
        let params = []

        if (dataInicio) {
            condicoes.push("venda.data_venda >= ?")
            params.push(dataInicio)
        }
        if (dataFim) {
            condicoes.push("venda.data_venda < date_add(?, interval 1 day)")
            params.push(dataFim)
        }

        let sql = `select
                coalesce(sum(venda.valor_total), 0) as faturamento
            from tbl_venda as venda`
        if (condicoes.length > 0) {
            sql += ` where ${condicoes.join(" and ")}`
        }

        const faturamentoResult = await knexConnection.raw(sql, params)
        if (!Array.isArray(faturamentoResult)) {
            return false
        }

        sql = `select
                produto.id as id_produto,
                produto.nome as produto,
                sum(item.quantidade) as quantidade,
                sum(item.quantidade * item.preco_unitario) as total_vendido
            from tbl_item_venda as item
            inner join tbl_venda as venda on venda.id = item.id_venda
            inner join tbl_produto as produto on produto.id = item.id_produto`
        if (condicoes.length > 0) {
            sql += ` where ${condicoes.join(" and ")}`
        }
        sql += ` group by produto.id, produto.nome
            order by total_vendido desc, produto.nome`

        const produtosResult = await knexConnection.raw(sql, params)
        if (!Array.isArray(produtosResult)) {
            return false
        }

        return {
            faturamento: Number(faturamentoResult[0][0].faturamento),
            produtos: produtosResult[0]
        }
    } catch (error) {
        console.error(error)
        return false
    }
}

module.exports = {
    selectProdutoForVenda,
    insertVenda,
    insertItemVenda,
    selectVendaById,
    selectAllVendas,
    selectRelatorioVendas
}
