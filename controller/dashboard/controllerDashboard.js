const configMessages = require("../module/configMessage.js")
const dashboardDAO = require("../../model/DAO/dashboard/dashboard.js")

const buscarResumo = async function () {
    const customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        const result = await dashboardDAO.selectResumo()
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_DASHBOARD
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.response.resumo = {
            quantidade_produtos: Number(result.quantidade_produtos),
            produtos_ativos: Number(result.produtos_ativos),
            unidades_em_estoque: Number(result.unidades_em_estoque),
            produtos_estoque_baixo: Number(result.produtos_estoque_baixo),
            valor_estimado_estoque: Number(result.valor_estimado_estoque),
            quantidade_vendas: Number(result.quantidade_vendas),
            valor_total_vendido: Number(result.valor_total_vendido)
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarMaisVendidos = async function () {
    const customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        const result = await dashboardDAO.selectMaisVendidos()
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_DASHBOARD
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.count = result.length
        customMessage.DEFAULT_MESSAGE.response.produtos = result.map(function (produto) {
            return {
                id_produto: Number(produto.id_produto),
                nome_produto: produto.nome_produto,
                quantidade_vendida: Number(produto.quantidade_vendida),
                valor_total_vendido: Number(produto.valor_total_vendido)
            }
        })

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    buscarResumo,
    listarMaisVendidos
}
