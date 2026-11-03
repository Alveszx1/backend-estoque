
const knex = require("knex");
const config = require("../model/database_config/knex.config.js");
const vendaDAO = require("../model/DAO/venda/venda.js");
const movimentacaoDAO = require("../model/DAO/movimentacao/tipoMovimentacao.js");
const estoqueService = require("./estoqueService.js");

const db = knex(config.development);


// {
//     "itens": [
//         {
//             "id_produto": 1,
//             "quantidade": 2
//         },
//         {
//             "id_produto": 3,
//             "quantidade": 5
//         }
//     ]
// }

const registrarVenda = async function (itens) {
    try {
        return await db.transaction(async function (trx) {

            let itensVenda = [];
            let valorTotal = 0;

            // 1. Buscar os produtos e calcular o total
            for (const item of itens) {
                const idProduto = Number(item.id_produto);
                const quantidade = Number(item.quantidade);

                const produto = await vendaDAO.selectProdutoForVenda(idProduto, trx);

                if (!produto) {
                    return "produto_not_found";
                }

                const preco = Number(produto.preco_unitario);

                valorTotal += preco * quantidade;

                itensVenda.push({
                    id_produto: idProduto,
                    quantidade: quantidade,
                    preco_unitario: preco
                });
            }

            // 2. Conferir o estoque
            for (const item of itensVenda) {
                const saldo = await estoqueService.validarSaldo(
                    item.id_produto,
                    item.quantidade,
                    trx
                );

                if (!saldo) {
                    return "insufficient_stock";
                }
            }

            // 3. Cadastrar a venda
            valorTotal = Number(valorTotal.toFixed(2));

            const idVenda = await vendaDAO.insertVenda(valorTotal, trx);

            if (!idVenda) {
                throw new Error("Erro ao cadastrar venda");
            }

            // 4. Cadastrar os itens e as saídas
            for (const item of itensVenda) {
                await vendaDAO.insertItemVenda({
                    ...item,
                    id_venda: idVenda
                }, trx);

                await movimentacaoDAO.insertMovimentacao({
                    ...item,
                    id_venda: idVenda,
                    observacao: null,
                    id_tipo_movimentacao: 2
                }, trx);
            }

            return {
                id: idVenda,
                valor_total: valorTotal,
                itens: itensVenda
            };
        });

    } catch (error) {
        console.error(error);
        return false;
    }
};

const buscarVendaById = async function (idVenda) {
    const result = await vendaDAO.selectVendaById(idVenda)

    if (result === false) {
        return false
    }

    if (result.length === 0) {
        return null
    }

    const venda = {
        id: Number(result[0].id),
        data_venda: result[0].data_venda,
        valor_total: Number(result[0].valor_total),
        itens: []
    }

    for (const row of result) {
        if (row.id_item !== null) {
            venda.itens.push({
                id: Number(row.id_item),
                id_produto: Number(row.id_produto),
                nome_produto: row.nome_produto,
                quantidade: Number(row.quantidade),
                preco_unitario: Number(row.preco_unitario)
            })
        }
    }

    return venda
}

const listarVendas = async function (dataInicio, dataFim) {
    const result = await vendaDAO.selectAllVendas(dataInicio, dataFim)

    if (result === false) {
        return false
    }

    return result.map(function (venda) {
        return {
            id: Number(venda.id),
            data_venda: venda.data_venda,
            valor_total: Number(venda.valor_total)
        }
    })
}

const listarRelatorioVendas = async function (dataInicio, dataFim) {
    const result = await vendaDAO.selectRelatorioVendas(dataInicio, dataFim)

    console.log(result)

    if (result === false) {
        return false
    }

    const formatarData = (data) => data.split("-").reverse().join("/")

    let periodo = "Todo o período"

    if (dataInicio && dataFim) {
        periodo = `${formatarData(dataInicio)} a ${formatarData(dataFim)}`
    } else if (dataInicio) {
        periodo = `A partir de ${formatarData(dataInicio)}`
    } else if (dataFim) {
        periodo = `Até ${formatarData(dataFim)}`
    }

    const produtos = result.produtos.map((produto) => ({
        id_produto: Number(produto.id_produto),
        produto: produto.produto,
        quantidade: Number(produto.quantidade),
        total_vendido: Number(produto.total_vendido)
    }))

    return {
        periodo,
        faturamento: result.faturamento,
        itens_vendidos: produtos.reduce((total, p) => total + p.quantidade, 0),
        produtos_vendidos: produtos.length,
        produtos
    }
}

module.exports = {
    registrarVenda,
    buscarVendaById,
    listarVendas,
    listarRelatorioVendas
};