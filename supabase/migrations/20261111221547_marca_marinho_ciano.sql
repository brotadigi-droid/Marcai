-- Nova marca: marinho e ciano passam a ser as cores padrão do negócio.
alter table public.negocios alter column cor_principal set default '#0F2340';
alter table public.negocios alter column cor_destaque set default '#14B8C4';

-- Quem ainda está com o padrão antigo (amarelo e petróleo) passa para o novo padrão.
update public.negocios
set cor_principal = '#0F2340', cor_destaque = '#14B8C4'
where cor_principal = '#0F3D3E' and cor_destaque = '#FFD23F';
