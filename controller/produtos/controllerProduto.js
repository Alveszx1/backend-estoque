/****************************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento , manipulação de dados para realizar o CRUD do produto
 * Data: 09/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */

const configMessages = require("../module/configMessage.js")
const produtoDAO = require("../../model/DAO/produto/produto.js")
const categoriaDAO = require("../../model/DAO/categoria/categoria.js")

const validarDadosProduto = async function (produto) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    if (produto == undefined || produto == null || typeof produto !== "object" || Array.isArray(produto)) {
        customMessage.ERROR_BAD_REQUEST.field = "[PRODUTO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (typeof produto.nome !== "string" || produto.nome.trim() === "" || produto.nome.length > 100) {
        customMessage.ERROR_BAD_REQUEST.field = "[NOME] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if ((typeof produto.preco_unitario !== "number" && typeof produto.preco_unitario !== "string") || produto.preco_unitario === "" || !Number.isFinite(Number(produto.preco_unitario)) || Number(produto.preco_unitario) <= 0 || Number(produto.preco_unitario) > 99999999.99) {
        customMessage.ERROR_BAD_REQUEST.field = "[PRECO_UNITARIO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if ((typeof produto.estoque_minimo !== "number" && typeof produto.estoque_minimo !== "string") || produto.estoque_minimo === "" || !Number.isSafeInteger(Number(produto.estoque_minimo)) || Number(produto.estoque_minimo) <= 0) {
        customMessage.ERROR_BAD_REQUEST.field = "[ESTOQUE_MINIMO] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else if (produto.descricao !== undefined && produto.descricao !== null && typeof produto.descricao !== "string") {
        customMessage.ERROR_BAD_REQUEST.field = "[DESCRICAO] INVÁLIDA"
        return customMessage.ERROR_BAD_REQUEST

    } else if ((typeof produto.id_categoria !== "number" && typeof produto.id_categoria !== "string") || produto.id_categoria === "" || !Number.isSafeInteger(Number(produto.id_categoria)) || Number(produto.id_categoria) < 1) {
        customMessage.ERROR_BAD_REQUEST.field = "[ID_CATEGORIA] INVÁLIDO"
        return customMessage.ERROR_BAD_REQUEST

    } else {
        return false
    }
}

const insertProduto = async function (produto, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {

        if (String(contentType).toUpperCase() == "APPLICATION/JSON") {

            let validarDadosProdutoResult = await validarDadosProduto(produto)
            if (!validarDadosProdutoResult) {

                let result = await produtoDAO.insertProduto(produto)
                if (result) {

                    produto.id = result

                    customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_CREATED_ITEM.status
                    customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_CREATED_ITEM.status_code
                    customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_CREATED_ITEM.message
                    customMessage.DEFAULT_MESSAGE.response = produto

                    return customMessage.DEFAULT_MESSAGE

                } else {
                    return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
                }

            } else {
                return validarDadosProdutoResult
            }

        } else {
            return customMessage.ERROR_CONTENT_TYPE
        }

    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarProduto = async function (id, produto, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).split(";")[0].trim().toUpperCase() !== "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        if (typeof id !== "string" || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }

        let validarDadosProdutoResult = await validarDadosProduto(produto)
        if (validarDadosProdutoResult) {
            return validarDadosProdutoResult
        }

        let categoria = await categoriaDAO.selectCategoriaById(Number(produto.id_categoria))
        if (categoria === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_CATEGORIA
        }
        if (categoria.length === 0) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID_CATEGORIA] CATEGORIA NÃO ENCONTRADA"
            return customMessage.ERROR_BAD_REQUEST
        }

        let result = await produtoDAO.updateProduto(Number(id), produto)
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
        }
        if (result === null) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_UPDATE_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_UPDATE_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_UPDATE_ITEM.message
        customMessage.DEFAULT_MESSAGE.response.produto = {
            id: Number(id),
            nome: produto.nome,
            descricao: produto.descricao ?? null,
            preco_unitario: Number(produto.preco_unitario),
            estoque_minimo: Number(produto.estoque_minimo),
            id_categoria: Number(produto.id_categoria)
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const atualizarStatusProduto = async function (id, dados, contentType) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (String(contentType).split(";")[0].trim().toUpperCase() !== "APPLICATION/JSON") {
            return customMessage.ERROR_CONTENT_TYPE
        }

        if (typeof id !== "string" || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }

        if (dados == null || typeof dados !== "object" || Array.isArray(dados) || typeof dados.is_ativo !== "boolean") {
            customMessage.ERROR_BAD_REQUEST.field = "[IS_ATIVO] DEVE SER BOOLEANO"
            return customMessage.ERROR_BAD_REQUEST
        }

        let result = await produtoDAO.updateStatusProduto(Number(id), dados.is_ativo)
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
        }
        if (result === null) {
            return customMessage.ERROR_NOT_FOUND
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_UPDATE_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_UPDATE_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_UPDATE_ITEM.message
        customMessage.DEFAULT_MESSAGE.response.produto = {
            id: Number(id),
            is_ativo: dados.is_ativo
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const excluirProduto = async function (id) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (typeof id !== "string" || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        }

        let result = await produtoDAO.deleteProduto(Number(id))
        if (result === false) {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
        }
        if (result === "not_found") {
            return customMessage.ERROR_NOT_FOUND
        }
        if (result === "has_history") {
            return customMessage.ERROR_PRODUCT_HAS_HISTORY
        }

        customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_DELETED_ITEM.status
        customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_DELETED_ITEM.status_code
        customMessage.DEFAULT_MESSAGE.message = customMessage.SUCCESS_DELETED_ITEM.message
        customMessage.DEFAULT_MESSAGE.response.produto = {
            id: Number(id)
        }

        return customMessage.DEFAULT_MESSAGE
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const listarProdutos = async function () {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        let result = await produtoDAO.selectAllProdutos()

        if (result) {
            if (result.length > 0) {
                result.forEach(function (produto) {
                    produto.situacao_estoque =
                        Number(produto.estoque_atual) < Number(produto.estoque_minimo)
                            ? "Abaixo do mínimo"
                            : "Normal"
                })

                customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
                customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
                customMessage.DEFAULT_MESSAGE.count = result.length
                customMessage.DEFAULT_MESSAGE.response.produtos = result

                return customMessage.DEFAULT_MESSAGE
            } else {
                return customMessage.ERROR_NOT_FOUND
            }
        } else {
            return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
        }
    } catch (error) {
        console.error(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const buscarProdutoById = async function (id) {
    let customMessage = JSON.parse(JSON.stringify(configMessages))

    try {
        if (id == undefined || id == "" || id == null || isNaN(id) || id < 1) {
            customMessage.ERROR_BAD_REQUEST.field = "[ID] INVÁLIDO"
            return customMessage.ERROR_BAD_REQUEST
        } else {
            let result = await produtoDAO.selectByIdProduto(id)

            if (result) {
                if (result.length > 0) {
                    customMessage.DEFAULT_MESSAGE.status = customMessage.SUCCESS_RESPONSE.status
                    customMessage.DEFAULT_MESSAGE.status_code = customMessage.SUCCESS_RESPONSE.status_code
                    customMessage.DEFAULT_MESSAGE.response.produto = result

                    return customMessage.DEFAULT_MESSAGE
                } else {
                    return customMessage.ERROR_NOT_FOUND
                }
            } else {
                return customMessage.ERROR_INTERNAL_SERVER_MODEL_PRODUTO
            }
        }
    } catch (error) {
        console.log(error)
        return customMessage.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

module.exports = {
    validarDadosProduto,
    insertProduto,
    atualizarProduto,
    atualizarStatusProduto,
    excluirProduto,
    listarProdutos,
    buscarProdutoById
}