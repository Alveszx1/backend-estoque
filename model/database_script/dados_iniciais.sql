use db_estoque_mais;

#LIMPAR OS DADOS ANTIGOS (apaga TODOS os dados das tabelas, a estrutura continua)
########################################################################################
# Se voce nao quer apagar o que ja tem, apague este bloco
delete from tbl_movimentacao;
delete from tbl_item_venda;
delete from tbl_venda;
delete from tbl_produto;
delete from tbl_categoria;
delete from tbl_tipo_movimentacao;

alter table tbl_movimentacao      auto_increment = 1;
alter table tbl_item_venda        auto_increment = 1;
alter table tbl_venda             auto_increment = 1;
alter table tbl_produto           auto_increment = 1;
alter table tbl_categoria         auto_increment = 1;
alter table tbl_tipo_movimentacao auto_increment = 1;


#CATEGORIA
########################################################################################
insert into tbl_categoria (id, nome) values
(1, 'Construção'),
(2, 'Hidráulica'),
(3, 'Acabamento'),
(4, 'Elétrica');


#TIPO MOVIMENTACAO
########################################################################################
insert into tbl_tipo_movimentacao (id, tipo) values
(1, 'Entrada'),
(2, 'Saída');


#PRODUTO
########################################################################################
insert into tbl_produto (id, nome, descricao, preco_unitario, estoque_minimo, is_ativo, id_categoria) values
(1,  'Areia média lavada',        'Areia média lavada para reboco e assentamento.',       149.00,  5, true, 1),
(2,  'Argamassa AC III 20kg',     'Saco de 20kg para assentamento de porcelanato.',        39.90, 12, true, 1),
(3,  'Broxa 5"',                  'Broxa de cerdas naturais para pintura e limpeza.',      22.90,  8, true, 3),
(4,  'Cabo flexível 2,5mm 100m',  'Rolo de 100 metros, cabo flexível 2,5mm.',             289.00,  4, true, 4),
(5,  'Cimento CP II 50kg',        'Saco de 50kg, uso geral em alvenaria e concreto.',      32.50, 20, true, 1),
(6,  'Disjuntor 20A',             'Disjuntor monopolar 20A curva C.',                      18.50, 25, true, 4),
(7,  'Fita veda-rosca 18mm',      'Rolo de fita veda-rosca para vedação de conexões.',      4.20, 50, true, 2),
(8,  'Lâmpada LED 9W',            'Lâmpada LED branca, soquete E27.',                      12.90, 30, true, 4),
(9,  'Tinta Acrílica Branca 18L', 'Lata de 18 litros, acabamento fosco para paredes.',    199.00, 10, true, 3),
(10, 'Torneira de parede',        'Torneira de parede para uso geral.',                    74.90, 10, true, 2),
(11, 'Tubo PVC 100mm',            'Tubo PVC 100mm para esgoto.',                           47.50, 15, true, 2);


#VENDA (o numero da venda e o id)
########################################################################################
insert into tbl_venda (id, data_venda, valor_total) values
(1048, '2026-10-02 10:12:00', 549.70),
(1049, '2026-10-04 15:40:00', 398.00),
(1050, '2026-10-06 09:05:00', 430.40),
(1051, '2026-10-09 11:25:00', 149.00),
(1052, '2026-10-11 16:10:00', 941.10),
(1053, '2026-10-13 08:50:00', 387.00),
(1054, '2026-10-16 09:42:00', 627.00),
(1055, '2026-10-17 14:30:00', 479.00);


#ITEM VENDA (preco_unitario = preco do produto no momento da venda)
########################################################################################
insert into tbl_item_venda (id_venda, id_produto, quantidade, preco_unitario) values
(1048,  5, 10,  32.50),
(1048, 10,  3,  74.90),

(1049,  9,  2, 199.00),

(1050,  7, 12,   4.20),
(1050, 11,  8,  47.50),

(1051,  1,  1, 149.00),

(1052,  2,  5,  39.90),
(1052,  3,  4,  22.90),
(1052,  5, 20,  32.50),

(1053,  8, 30,  12.90),

(1054,  8, 40,  12.90),
(1054,  6,  6,  18.50),

(1055,  4,  1, 289.00),
(1055, 11,  4,  47.50);


#MOVIMENTACAO
########################################################################################

# ENTRADAS (tipo 1)
insert into tbl_movimentacao (data_movimentacao, quantidade, observacao, id_produto, id_tipo_movimentacao, id_venda) values
('2026-10-01 07:00:00',  5, 'Compra de fornecedor',  1, 1, null),
('2026-10-01 07:00:00', 11, 'Compra de fornecedor',  2, 1, null),
('2026-10-01 07:00:00', 18, 'Compra de fornecedor',  3, 1, null),
('2026-10-01 07:00:00', 11, 'Compra de fornecedor',  4, 1, null),
('2026-10-01 07:00:00', 54, 'Compra de fornecedor',  5, 1, null),
('2026-10-01 07:00:00', 52, 'Compra de fornecedor',  7, 1, null),
('2026-10-01 07:00:00',100, 'Compra de fornecedor',  8, 1, null),
('2026-10-01 07:00:00', 40, 'Compra de fornecedor',  9, 1, null),
('2026-10-01 07:00:00', 30, 'Compra de fornecedor', 10, 1, null),
('2026-10-01 07:00:00', 24, 'Compra de fornecedor', 11, 1, null),
('2026-10-12 07:45:00', 60, 'Compra de fornecedor',  5, 1, null),
('2026-10-12 11:40:00', 24, 'Compra de fornecedor',  6, 1, null),
('2026-10-13 07:30:00',100, 'Compra de fornecedor',  8, 1, null);

# SAIDAS DE VENDA (tipo 2, ligadas a venda pelo id_venda)
insert into tbl_movimentacao (data_movimentacao, quantidade, observacao, id_produto, id_tipo_movimentacao, id_venda) values
('2026-10-02 10:12:00', 10, null,  5, 2, 1048),
('2026-10-02 10:12:00',  3, null, 10, 2, 1048),
('2026-10-04 15:40:00',  2, null,  9, 2, 1049),
('2026-10-06 09:05:00', 12, null,  7, 2, 1050),
('2026-10-06 09:05:00',  8, null, 11, 2, 1050),
('2026-10-09 11:25:00',  1, null,  1, 2, 1051),
('2026-10-11 16:10:00',  5, null,  2, 2, 1052),
('2026-10-11 16:10:00',  4, null,  3, 2, 1052),
('2026-10-11 16:10:00', 20, null,  5, 2, 1052),
('2026-10-13 08:50:00', 30, null,  8, 2, 1053),
('2026-10-16 09:42:00', 40, null,  8, 2, 1054),
('2026-10-16 09:42:00',  6, null,  6, 2, 1054),
('2026-10-17 14:30:00',  1, null,  4, 2, 1055),
('2026-10-17 14:30:00',  4, null, 11, 2, 1055);

# OUTRAS SAIDAS (sem venda)
insert into tbl_movimentacao (data_movimentacao, quantidade, observacao, id_produto, id_tipo_movimentacao, id_venda) values
('2026-10-14 17:20:00',  1, 'Uso interno',     4, 2, null),
('2026-10-15 15:30:00',  4, 'Uso interno',     1, 2, null),
('2026-10-16 18:05:00', 10, 'Perda ou avaria', 8, 2, null);


#CONFERENCIA DO SALDO DE CADA PRODUTO
########################################################################################
select  p.id,
        p.nome,
        sum(if(mv.id_tipo_movimentacao = 1, mv.quantidade, -mv.quantidade)) as estoque_atual,
        p.estoque_minimo
from    tbl_produto p
        left join tbl_movimentacao mv on mv.id_produto = p.id
group by p.id;