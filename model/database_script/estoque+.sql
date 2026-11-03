
create database db_estoque_mais;

use db_estoque_mais;

#CATEGORIA
########################################################################################

#CRIAÇÃO DA TABELA categoria
create table tbl_categoria(
	id 			          int                     not null primary key auto_increment,
    nome 		          varchar (50)            not null
);

#PRODUTO
########################################################################################

#CRIAÇÃO DA TABELA produto
create table tbl_produto(
	id 			          int                     not null primary key auto_increment,
    nome 		          varchar (100)           not null,
    descricao             text,
    preco_unitario        decimal(10,2)           not null,
    estoque_minimo        int                     not null,
    is_ativo              boolean                 not null default true,

    id_categoria          int                     not null,

    #fazer relacao entre duas tabelas 
    constraint			FK_CATEGORIA_PRODUTO	      # nome do relacionamento
    foreign key			(id_categoria)				  # quem sera a FK natabla FK(foren key)
    references			tbl_categoria(id)			  # de onde vem a FK
);

#VENDA
########################################################################################

#CRIAÇÃO DA TABELA venda (o numero da venda, ex: #1055, e o id)
create table tbl_venda(
	id 			          int                     not null primary key auto_increment,
    data_venda            datetime                not null,
    valor_total           decimal(10,2)           not null
);

#CRIAÇÃO DA TABELA item venda
create table tbl_item_venda(
	id 			          int                     not null primary key auto_increment,
    quantidade            int                     not null,
    preco_unitario        decimal(10,2)           not null,    # preco do produto no momento da venda

    id_venda              int                     not null,
    id_produto            int                     not null,

    #fazer relacao entre duas tabelas 
    constraint			FK_VENDA_ITEMVENDA	          # nome do relacionamento
    foreign key			(id_venda)				      # quem sera a FK natabla FK(foren key)
    references			tbl_venda(id),			      # de onde vem a FK

    #fazer relacao entre duas tabelas 
    constraint			FK_PRODUTO_ITEMVENDA	      # nome do relacionamento
    foreign key			(id_produto)				  # quem sera a FK natabla FK(foren key)
    references			tbl_produto(id)			      # de onde vem a FK
);

#MOVIMENTACAO
########################################################################################

#CRIAÇÃO DA TABELA tipo movimentacao (Entrada / Saida)
create table tbl_tipo_movimentacao(
	id 			          int                     not null primary key auto_increment,
    tipo 		          varchar (20)            not null
);

#CRIAÇÃO DA TABELA movimentacao (o saldo do produto = soma das entradas - soma das saidas)
create table tbl_movimentacao(
	id 			          int                     not null primary key auto_increment,
    data_movimentacao     datetime                not null,
    quantidade            int                     not null,
    observacao            text,

    id_produto            int                     not null,
    id_tipo_movimentacao  int                     not null,
    id_venda              int                     null,

    #fazer relacao entre duas tabelas 
    constraint			FK_PRODUTO_MOVIMENTACAO	      # nome do relacionamento
    foreign key			(id_produto)				  # quem sera a FK natabla FK(foren key)
    references			tbl_produto(id),			  # de onde vem a FK

    #fazer relacao entre duas tabelas 
    constraint			FK_TIPO_MOVIMENTACAO_MOVIMENTACAO
    foreign key			(id_tipo_movimentacao)
    references			tbl_tipo_movimentacao(id),

    #fazer relacao entre duas tabelas 
    constraint			FK_VENDA_MOVIMENTACAO	      # nome do relacionamento
    foreign key			(id_venda)				      # quem sera a FK natabla FK(foren key)
    references			tbl_venda(id)			      # de onde vem a FK
);

#DADOS QUE APARECEM NAS TELAS
########################################################################################

insert into tbl_categoria (nome) values
('Construção'),
('Hidráulica'),
('Acabamento'),
('Elétrica');

insert into tbl_tipo_movimentacao (tipo) values
('Entrada'),
('Saída');

#SALDO ATUAL DE CADA PRODUTO (tela Produtos e Visao geral)
########################################################################################

select  p.id,
        p.nome,
        coalesce(sum(case
            when t.tipo = 'Entrada' then mv.quantidade
            when t.tipo = 'Saída' then -mv.quantidade
            else 0
        end), 0) as estoque_atual,
        p.estoque_minimo
from    tbl_produto p
        left join tbl_movimentacao mv   on mv.id_produto = p.id
        left join tbl_tipo_movimentacao t on t.id = mv.id_tipo_movimentacao
group by p.id, p.nome, p.estoque_minimo;