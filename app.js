const express = require("express")
const cors = require("cors")
const app = express()


const corsOptions = {
    origin: "*", // Configuração de origem da requisição (IP ou Dominio)
    methods: "GET, POST, PUT, DELETE, OPTIONS",  // Configuração dos verbos que serão utilizados na API
    allowedHeaders: ['Content-type', "Authorization"]
}


const doadoraRouter = require("./routes/categoria.router")
const produtoRouter = require("./routes/produto.router")
const movimentacaoRouter = require("./routes/movimentacao.router")
const vendaRouter = require("./routes/venda.router")
const dashboardRouter = require("./routes/dashboard.router")

app.use(cors(corsOptions))

app.use("/v1/estoque/categoria", doadoraRouter)
app.use("/v1/estoque/produto", produtoRouter)
app.use("/v1/estoque/movimentacoes", movimentacaoRouter)
app.use("/v1/estoque/vendas", vendaRouter)
app.use("/v1/estoque/dashboard", dashboardRouter)

app.listen(9090, function(){
    console.log("API aguardando novas requisições..............")
})
