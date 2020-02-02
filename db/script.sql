

alter table partido add  idpartido_estado  INTEGER NOT NULL DEFAULT 1;

ALTER TABLE partido
    ADD CONSTRAINT fk_partido_estado FOREIGN KEY (idpartido_estado) REFERENCES partido_estado (id);



-- **********************************************************
-- 16/01/2020  EN PRODUCCION : SI

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partidoxjugador_estado') THEN
		drop TABLE partidoxjugador_estado;
end if;

CREATE TABLE partidoxjugador_estado
 (id  serial PRIMARY KEY, 
 descripcion TEXT NOT NULL );

insert into partidoxjugador_estado (descripcion) 
    values('Aceptado');
insert into partidoxjugador_estado (descripcion) 
    values('Suplente');


update partido set jugadoresapuntados = 0

delete from partidoxjugador;


alter table partidoxjugador add  idpartidoxjugador_estado  INTEGER NOT NULL;

ALTER TABLE partidoxjugador
    ADD CONSTRAINT fk_partidoxjugador_estado FOREIGN KEY (idpartidoxjugador_estado) REFERENCES partidoxjugador_estado (id);
