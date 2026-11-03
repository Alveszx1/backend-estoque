const express = require("express")
const bodyParser = require("body-parser")
const controllerVenda = require("../controller/vendas/controllerVenda.js")

const router = express.Router()
const bodyParserJson = bodyParser.json()

router.post("/", bodyParserJson, async function (request, response) {
    let dados = request.body
    let contentType = request.headers['content-type']
    let result = await controllerVenda.insertVenda(dados, contentType)

    response.status(result.status_code)
    response.json(result)
})

router.get("/", async function (request, response) {

    let data_inicio = request.query.data_inicio
    let data_fim = request.query.data_fim
    let result = await controllerVenda.listarVendas( data_inicio , data_fim)

    response.status(result.status_code)
    response.json(result)
})

router.get("/relatorio", async function (request, response) {
    let result = await controllerVenda.gerarRelatorioVendas(
        request.query.data_inicio,
        request.query.data_fim
    )

    response.status(result.status_code)
    response.json(result)
})

router.get("/:id", async function (request, response) {

    let id = request.params.id
    let result = await controllerVenda.buscarVendaById(id)

    response.status(result.status_code)
    response.json(result)
})

module.exports = router
