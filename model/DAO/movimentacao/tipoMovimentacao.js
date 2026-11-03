const knex = require("knex")
const knexDatabaseConfig = require("../../database_config/knex.config.js")

const knexConection = knex(knexDatabaseConfig.development)

const insertMovimentacao = async function (mov, db = knexConection) {
    try {
        let sql = `insert into tbl_movimentacao
            (data_movimentacao, quantidade, observacao, id_produto, id_tipo_movimentacao, id_venda)
        values
            (now(), ?, ?, ?, ?, ?)`

        let result = await db.raw(sql, [
            mov.quantidade,
            mov.observacao || null,
            mov.id_produto,
            mov.id_tipo_movimentacao,
            mov.id_venda || null
        ])

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

const selectAllTipos = async function () {
    try {
        let sql = `select
            id,
            tipo
        from tbl_tipo_movimentacao`

        let result = await knexConection.raw(sql)

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

const selectAllMovimentacoes = async function (filtros = {}) {
    try {
        let sql = `select
            movimentacao.id,
            movimentacao.data_movimentacao,
            movimentacao.quantidade,
            movimentacao.observacao,
            movimentacao.id_produto,
            produto.nome as nome_produto,
            movimentacao.id_tipo_movimentacao,
            tipo.tipo as tipo_movimentacao,
            movimentacao.id_venda
        from tbl_movimentacao as movimentacao
        inner join tbl_produto as produto on produto.id = movimentacao.id_produto
        inner join tbl_tipo_movimentacao as tipo on tipo.id = movimentacao.id_tipo_movimentacao`
        let condicoes = []
        let bindings = []

        if (filtros.id_produto !== undefined) {
            condicoes.push(`movimentacao.id_produto = ?`)
            bindings.push(Number(filtros.id_produto))
        }
        if (filtros.id_tipo_movimentacao !== undefined) {
            condicoes.push(`movimentacao.id_tipo_movimentacao = ?`)
            bindings.push(Number(filtros.id_tipo_movimentacao))
        }
        if (filtros.data_inicio !== undefined) {
            condicoes.push(`movimentacao.data_movimentacao >= ?`)
            bindings.push(`${filtros.data_inicio} 00:00:00`)
        }
        if (filtros.data_fim !== undefined) {
            condicoes.push(`movimentacao.data_movimentacao < date_add(?, interval 1 day)`)
            bindings.push(`${filtros.data_fim} 00:00:00`)
        }

        if (condicoes.length > 0) {
            sql += ` where ${condicoes.join(" and ")}`
        }

        sql += ` order by movimentacao.data_movimentacao desc, movimentacao.id desc`

        let result = await knexConection.raw(sql, bindings)
        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.error(error)
        return false
    }
}

const selectMovimentacoesUltimos14Dias = async function () {
    try {
        const sql = `select
                date(data_movimentacao) as data,
                sum(case when id_tipo_movimentacao = 1 then quantidade else 0 end) as entradas,
                sum(case when id_tipo_movimentacao = 2 then quantidade else 0 end) as saidas
            from tbl_movimentacao
            where data_movimentacao >= date_sub(curdate(), interval 13 day)
              and data_movimentacao < date_add(curdate(), interval 1 day)
            group by date(data_movimentacao)
            order by data`
        const result = await knexConection.raw(sql)

        return Array.isArray(result) ? result[0] : false
    } catch (error) {
        console.error(error)
        return false
    }
}

const selectSaldoByIdProduto = async function (idProduto, db = knexConection) {
    try {
        let sql = `select
            sum(if(tbl_movimentacao.id_tipo_movimentacao = 1,
                   tbl_movimentacao.quantidade,
                   -tbl_movimentacao.quantidade)) as saldo
        from tbl_movimentacao
        where tbl_movimentacao.id_produto = ?`

        let result = await db.raw(sql, [idProduto])

        if (Array.isArray(result)) {
            return Number(result[0][0].saldo)
        } else {
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}
module.exports = {
    insertMovimentacao,
    selectAllTipos,
    selectAllMovimentacoes,
    selectMovimentacoesUltimos14Dias,
    selectSaldoByIdProduto
}
