/**
 * Objetivo: Arquivo responsável pela padronização das mensagens e status code do projeto Estoque+
 * Data: 20/10/2026
 * Autor: Bruno Haddad Alves
 * Versão: 1.0
 */



const DEFAULT_MESSAGE = {
    api_description: "API para controlar o estoque, as movimentações e as vendas do projeto Estoque+",
    development: "Bruno Haddad Alves",
    version: "1.0",
    status: Boolean,
    status_code: Number,
    response: {}
}



const ERROR_BAD_REQUEST = {
    status: false,
    status_code: 400,
    message: "Não foi possível processar a requisição devido a erros nos dados enviados."
}

const ERROR_NOT_FOUND = {
    status: false,
    status_code: 404,
    message: "Não foram encontrados dados para retorno da requisição"
}

const ERROR_CONFLICT = {
    status: false,
    status_code: 409,
    message: "Não foi possível processar a requisição devido a um conflito (dado já cadastrado ou registro em uso por outra tabela)."
}

const ERROR_CONTENT_TYPE = {
    status: false,
    status_code: 415,
    message: "Não foi possível processar a requisição devido ao formato de dados encaminhado não ser suportado pelo servidor, apenas deve ser utilizado JSON"
}

const ERROR_INTERNAL_SERVER_CONTROLLER = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [CONTROLLER]"
}

const ERROR_INTERNAL_SERVER_MODEL = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL]"
}


//Mensagens de ERRO das regras de estoque

const ERROR_INSUFFICIENT_STOCK = {
    status: false,
    status_code: 409,
    message: "Não foi possível registrar a operação porque o estoque disponível é insuficiente para um ou mais produtos."
}

const ERROR_PRODUCT_HAS_HISTORY = {
    status: false,
    status_code: 409,
    message: "Não foi possível excluir o produto pois ele possui movimentações ou vendas registradas. Inative o produto em vez de excluir."
}

//Mensagens de ERRO de MODEL por tabela

const ERROR_INTERNAL_SERVER_MODEL_CATEGORIA = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_CATEGORIA]"
}

const ERROR_INTERNAL_SERVER_MODEL_PRODUTO = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_PRODUTO]"
}

const ERROR_INTERNAL_SERVER_MODEL_TIPO_MOVIMENTACAO = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_TIPO_MOVIMENTACAO]"
}

const ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_MOVIMENTACAO]"
}

const ERROR_INTERNAL_SERVER_MODEL_VENDA = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_VENDA]"
}

const ERROR_INTERNAL_SERVER_MODEL_ITEM_VENDA = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_ITEM_VENDA]"
}

const ERROR_INTERNAL_SERVER_MODEL_DASHBOARD = {
    status: false,
    status_code: 500,
    message: "Não foi possível processar a requisição devido a um erro interno no servidor [MODEL_DASHBOARD]"
}



const SUCCESS_RESPONSE = {
    status: true,
    status_code: 200,
}

const SUCCESS_CREATED_ITEM = {
    status: true,
    status_code: 201,
    message: "Item inserido com sucesso"
}

const SUCCESS_UPDATE_ITEM = {
    status: true,
    status_code: 200,
    message: "Item atualizado com sucesso!"
}

const SUCCESS_DELETED_ITEM = {
    status: true,
    status_code: 200,
    message: "Item excluido com sucesso!"
}


module.exports = {
    DEFAULT_MESSAGE,
    ERROR_BAD_REQUEST,
    ERROR_NOT_FOUND,
    ERROR_CONFLICT,
    ERROR_CONTENT_TYPE,
    ERROR_INTERNAL_SERVER_CONTROLLER,
    ERROR_INTERNAL_SERVER_MODEL,
    ERROR_INSUFFICIENT_STOCK,
    ERROR_PRODUCT_HAS_HISTORY,
    ERROR_INTERNAL_SERVER_MODEL_CATEGORIA,
    ERROR_INTERNAL_SERVER_MODEL_PRODUTO,
    ERROR_INTERNAL_SERVER_MODEL_TIPO_MOVIMENTACAO,
    ERROR_INTERNAL_SERVER_MODEL_MOVIMENTACAO,
    ERROR_INTERNAL_SERVER_MODEL_VENDA,
    ERROR_INTERNAL_SERVER_MODEL_ITEM_VENDA,
    ERROR_INTERNAL_SERVER_MODEL_DASHBOARD,
    SUCCESS_RESPONSE,
    SUCCESS_CREATED_ITEM,
    SUCCESS_UPDATE_ITEM,
    SUCCESS_DELETED_ITEM
}