const configMessages = require("../module/configMessage.js")
const tipoMovimentacaoDAO = require("../../model/DAO/movimentacao/tipoMovimentacao.js")
const estoqueService = require("../../services/estoqueService.js")

const validarDadosMovimentacao = async function (mov) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (mov == undefined || mov == null) {
        customMessage.ERROR_BAD_REQUEST.field = "[MOVIMENTACAO] INVALIDA"
        return customMessage.ERROR_BAD_REQUEST
    } else if (mov.quantidade == undefined || mov.quantidade == "" || mov.quantidade == null || isNaN(mov.quantidade) || !Number.isInteger(Number(mov.quantidade)) || mov.quantidade <= 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[QUANTIDADE] INVALIDA"
        return customMessage.ERROR_BAD_REQUEST
    } else if (mov.id_produto == undefined || mov.id_produto == "" || mov.id_produto == null || isNaN(mov.id_produto) || mov.id_produto < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_PRODUTO] INVALIDO"
        return customMessage.ERROR_BAD_REQUEST
    } else if (mov.id_tipo_movimentacao == undefined || mov.id_tipo_movimentacao == "" || mov.id_tipo_movimentacao == null || isNaN(mov.id_tipo_movimentacao) || mov.id_tipo_movimentacao < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_TIPO_MOVIMENTACAO] INVALIDO"
        return customMessage.ERROR_BAD_REQUEST
    } else if (mov.id_tipo_movimentacao != 1 && mov.id_tipo_movimentacao != 2) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_TIPO_MOVIMENTACAO] DEVE SER 1 (ENTRADA) OU 2 (SAIDA)"
        return customMessage.ERROR_BAD_REQUEST
    } else if (mov.observacao != undefined && mov.observacao != null && typeof mov.observacao !== "string") {
        customMessage.ERROR_BAD_REQUEST.field = "[OBSERVACAO] INVALIDA (deve ser texto)"
        return customMessage.ERROR_BAD_REQUEST
    } else {
        return false
    }
}

const validarData = function (data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false
    }

    const dataUtc = new Date(`${data}T00:00:00.000Z`)
    return !Number.isNaN(dataUtc.getTime()) && dataUtc.toISOString().slice(0, 10) === data
}

const listarMovimentacoes = async function (filtros) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (filtros.id_produto !== undefined &&
            (!Number.isSafeInteger(Number(filtros.id_produto)) || Number(filtros.id_produto) < 1)) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID_PRODUTO] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }
        if (filtros.id_tipo_movimentacao !== undefined &&
            ![1, 2].includes(Number(filtros.id_tipo_movimentacao))) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID_TIPO_MOVIMENTACAO] DEVE SER 1 (ENTRADA) OU 2 (SAÍDA)"
            return customMessage.ERROR_BAD_REQUEST
        }
        if ((filtros.data_inicio !== undefined && !validarData(filtros.data_inicio)) ||
            (filtros.data_fim !== undefined && !validarData(filtros.data_fim))) {
            customMessage.ERROR_BAD_REQUEST.field = "[DATA] INFORME DATAS VÁLIDAS NO FORMATO AAAA-MM-DD"
            return customMessage.ERROR_BAD_REQUEST
        }
        if (filtros.data_inicio && filtros.data_fim && filtros.data_inicio > filtros.data_fim) {
            customMessage.ERROR_BAD_REQUEST.field = "[PERÍODO] DATA_INICIO DEVE SER ANTERIOR OU IGUAL A DATA_FIM"
            return customMessage.ERROR_BAD_REQUEST
        }

        let result = await tipoMovimentacaoDAO.selectAllMovimentacoes(filtros)
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO
        }
        if (result.length === 0) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.count = result.length
        customMessage.DEFAULT_MESSAGE.response.movimentacoes = result

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarResumoUltimos14Dias = async function () {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        const result = await tipoMovimentacaoDAO.selectMovimentacoesUltimos14Dias()
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO
        }

        const movimentacoesPorDia = result.map(function (dia) {
            return {
                data: dia.data,
                entradas: Number(dia.entradas),
                saidas: Number(dia.saidas)
            }
        })

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
        customMessage.DEFAULT_MESSAGE.response.resumo = {
            periodo: "Últimos 14 dias",
            entradas: movimentacoesPorDia.reduce((total, dia) => total + dia.entradas, 0),
            saidas: movimentacoesPorDia.reduce((total, dia) => total + dia.saidas, 0),
            movimentacoes_por_dia: movimentacoesPorDia
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const insertMovimentacao = async function (mov, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).split(";")[0].trim().toUpperCase() !== "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        let validarDadosResult = await validarDadosMovimentacao(mov)
        if (validarDadosResult) {
            return validarDadosResult
        }

        if (Number(mov.id_tipo_movimentacao) === 2) {
            let saldoValido = await estoqueService.validarSaldo(mov.id_produto, mov.quantidade)

            if (saldoValido === null) {
                return customMessage.ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO
            }
            if (!saldoValido) {
                return customMessage.ERROR_INSUFFICIENT_STOCK
            }
        }

        let result = await tipoMovimentacaoDAO.insertMovimentacao(mov)
        if (!result) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
        customMessage.DEFAULT_MESSAGE.response.movimentacao = {
            ...mov,
            id: result
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarTipos = async function () {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let result = await tipoMovimentacaoDAO.selectAllTipos()

        if (result) {
            if (result.length > 0) {
                customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
                customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
                customMessage.DEFAULT_MESSAGE.count = result.length
                customMessage.DEFAULT_MESSAGE.response.tipos = result

                return customMessage.DEFAULT_MESSAGE
            } else {
                return customMessage.ERROR_NOT_FOUND
            }
        } else {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_TIPO_MOVIMENTACAO
        }
    } catch (error) {
        console.log(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    validarDadosMovimentacao,
    listarMovimentacoes,
    listarResumoUltimos14Dias,
    listarTipos,
    insertMovimentacao
}
