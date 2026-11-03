const movimentacaoDAO = require('../model/DAO/movimentacao/tipoMovimentacao.js')

const validarSaldo = async function (idProduto, quantidade, trx) {
    let saldo = await movimentacaoDAO.selectSaldoByIdProduto(idProduto, trx)

    if (saldo === false) {
        return null
    }

    return saldo >= quantidade
}

module.exports = {
    validarSaldo
}