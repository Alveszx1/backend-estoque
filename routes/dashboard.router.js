const express = require("express")
const controllerMovimentacao = require("../controller/movimentacao/controllerMovimentacao.js")
const controllerDashboard = require("../controller/dashboard/controllerDashboard.js")

const router = express.Router()

router.get("/resumo", async function (request, response) {
    const result = await controllerDashboard.buscarResumo()

    response.status(result.status_code)
    response.json(result)
})

router.get("/mais-vendidos", async function (request, response) {
    const result = await controllerDashboard.listarMaisVendidos()

    response.status(result.status_code)
    response.json(result)
})

router.get("/movimentos", async function (request, response) {
    const result = await controllerMovimentacao.listarResumoUltimos14Dias()

    response.status(result.status_code)
    response.json(result)
})

module.exports = router
