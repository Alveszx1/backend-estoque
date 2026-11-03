const configMessages = require("../module/configMessage.js")
const vendaService = require("../../services/vendaService.js")

const validarDadosVenda = async function (venda) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (venda == undefined || venda == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[VENDA] INVALIDA"
        return customMessage.ERROR_BAD_REQUEST
    } else if (!Array.isArray(venda.itens) || venda.itens.length == 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[ITENS] DEVE CONTER AO MENOS UM ITEM"
        return customMessage.ERROR_BAD_REQUEST
    } else if (!venda.itens.every(item => item != null && typeof item == "object" && !Array.isArray(item))) {
        customMessage.ERROR_BAD_REQUEST.field = "[ITEM] INVALIDO"
        return customMessage.ERROR_BAD_REQUEST
    } else if (!venda.itens.every(item => (typeof item.id_produto == "number" || typeof item.id_produto == "string") && item.id_produto != undefined && item.id_produto != "" && item.id_produto != null && !isNaN(item.id_produto) && Number.isInteger(Number(item.id_produto)) && item.id_produto > 0)) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_PRODUTO] INVALIDO"
        return customMessage.ERROR_BAD_REQUEST
    } else if (!venda.itens.every(item => (typeof item.quantidade == "number" || typeof item.quantidade == "string") && item.quantidade != undefined && item.quantidade != "" && item.quantidade != null && !isNaN(item.quantidade) && Number.isInteger(Number(item.quantidade)) && item.quantidade > 0)) {
        customMessage.ERROR_BAD_REQUEST.field = "[QUANTIDADE] INVALIDA"
        return customMessage.ERROR_BAD_REQUEST
    } else {
        return false
    }
}

const insertVenda = async function (venda, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).split(";")[0].trim().toUpperCase() != "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        let validarDadosResult = await validarDadosVenda(venda)
        if (validarDadosResult) {
            return validarDadosResult
        }

        let result = await vendaService.registrarVenda(venda.itens)
        if (result == "insufficient_stock") {
            return customMessage.ERROR_INSUFFICIENT_STOCK
        }
        if (result == "produto_not_found") {
            return customMessage.ERROR_NOT_FOUND
        }
        if (!result) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_VENDA
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
        customMessage.DEFAULT_MESSAGE.response.venda = result

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarVendaById = async function (id) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (typeof id !== "string" || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }

        let result = await vendaService.buscarVendaById(Number(id))

        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_VENDA
        }
        if (result === null) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.response.venda = result

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const validarData = function (data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false
    }

    const ano = Number(data.slice(0, 4))
    const dataUtc = new Date(`${data}T00:00:00.000Z`)
    return ano >= 1000 && !Number.isNaN(dataUtc.getTime()) && dataUtc.toISOString().slice(0, 10) === data
}

const validarPeriodo = function (dataInicio, dataFim) {

        let customMessage = JSON.parse(JSON.stringify(configMessages))

    if ((dataInicio !== undefined && !validarData(dataInicio)) ||
        (dataFim !== undefined && !validarData(dataFim))) {
        customMessage.ERROR_BAD_REQUEST.field = "[DATA] INFORME DATAS VÁLIDAS NO FORMATO AAAA-MM-DD"
        return customMessage.ERROR_BAD_REQUEST
    }

    if (dataInicio && dataFim && dataInicio > dataFim) {
        customMessage.ERROR_BAD_REQUEST.field = "[PERÍODO] DATA_INICIO DEVE SER ANTERIOR OU IGUAL A DATA_FIM"
        return customMessage.ERROR_BAD_REQUEST
    }

    return false
}

const listarVendas = async function (dataInicio, dataFim) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let validarPeriodoResult = validarPeriodo(dataInicio, dataFim, customMessage)
        if (validarPeriodoResult) {
            return validarPeriodoResult
        }

        let result = await vendaService.listarVendas(dataInicio, dataFim)

        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_VENDA
        }
        if (result.length === 0) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.count = result.length
        customMessage.DEFAULT_MESSAGE.response.vendas = result

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const gerarRelatorioVendas = async function (dataInicio, dataFim) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let validarPeriodoResult = validarPeriodo(dataInicio, dataFim)
        if (validarPeriodoResult) {
            return validarPeriodoResult
        }

        let result = await vendaService.listarRelatorioVendas(dataInicio, dataFim)
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_VENDA
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.response.relatorio = result

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    validarDadosVenda,
    insertVenda,
    buscarVendaById,
    listarVendas,
    gerarRelatorioVendas
}
