use db_estoque_mais;

alter table tbl_movimentacao
    add column id_tipo_movimentacao int null after id_produto;

update tbl_movimentacao as movimentacao
inner join tbl_motivo_movimentacao as motivo
    on motivo.id = movimentacao.id_motivo_movimentacao
set movimentacao.id_tipo_movimentacao = motivo.id_tipo_movimentacao;

alter table tbl_movimentacao
    modify column id_tipo_movimentacao int not null;

alter table tbl_movimentacao
    drop foreign key FK_MOTIVO_MOVIMENTACAO,
    drop column id_motivo_movimentacao,
    add constraint FK_TIPO_MOVIMENTACAO_MOVIMENTACAO
        foreign key (id_tipo_movimentacao)
        references tbl_tipo_movimentacao(id);

drop table tbl_motivo_movimentacao;
