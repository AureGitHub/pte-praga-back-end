
do $$
BEGIN



if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partidoxpista') THEN
		drop TABLE partidoxpista;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jugador_confirmar') THEN
		drop TABLE jugador_confirmar;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partidoxjugador') THEN
		drop TABLE partidoxjugador;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jugador_confirmar') THEN
		drop TABLE jugador_confirmar;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'partido') THEN
		drop TABLE partido;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jugador') THEN
		drop TABLE jugador;
end if;


if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jugador_estado') THEN
		drop TABLE jugador_estado;
end if;
if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'perfil') THEN
		drop TABLE perfil;
end if;

if EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posicion') THEN
		drop TABLE posicion;
end if;

CREATE TABLE jugador_estado
 (id  serial PRIMARY KEY, 
 descripcion TEXT NOT NULL );


 CREATE TABLE perfil
 (id  serial PRIMARY KEY, 
 descripcion TEXT NOT NULL );


 CREATE TABLE posicion
 (id  serial PRIMARY KEY, 
 descripcion TEXT NOT NULL );



CREATE TABLE jugador 
(id  serial PRIMARY KEY, 
 alias TEXT NOT NULL UNIQUE, 
 nombre TEXT NOT NULL UNIQUE, 
 email TEXT NOT NULL UNIQUE, 
 passwordhash TEXT, 
 idperfil INTEGER NOT NULL, 
 idposicion INTEGER NOT NULL, 
 idestado INTEGER NOT NULL, 
 FOREIGN KEY(idestado) REFERENCES jugador_estado(id), 
 FOREIGN KEY(idperfil) REFERENCES perfil(id), 
 FOREIGN KEY(idposicion) REFERENCES posicion(id) );

CREATE TABLE jugador_confirmar
 (iduser INTEGER NOT NULL, 
 uuid TEXT NOT NULL, 
 FOREIGN KEY(iduser) REFERENCES jugador(id) );


CREATE TABLE partido 
(id serial PRIMARY KEY,
idcreador INTEGER, 
dia timestamp with time zone NOT NULL,
duracion NUMERIC NOT NULL,
pistas INTEGER NOT NULL, 
jugadorestotal INTEGER NOT NULL, 
jugadoresapuntados INTEGER NOT NULL, 
FOREIGN KEY(idcreador) REFERENCES jugador(id) );



CREATE TABLE partidoxpista(
	id serial PRIMARY KEY,
	idpartido INTEGER NOT NULL,
	idpista INTEGER NOT NULL,
	idturno INTEGER NOT NULL,
	nombre TEXT NOT NULL,
	iddrive1 INTEGER NULL,
	iddrive2 INTEGER NULL,
	idreves1 INTEGER NULL,
	idreves2 INTEGER NULL,
	FOREIGN KEY (idpartido) REFERENCES partido(id),
	FOREIGN KEY (iddrive1)  REFERENCES jugador(id),
	FOREIGN KEY (iddrive2)  REFERENCES jugador(id),
	FOREIGN KEY (idreves1)  REFERENCES jugador(id),
	FOREIGN KEY (idreves2)  REFERENCES jugador(id)
);



CREATE TABLE partidoxjugador 
(id SERIAL PRIMARY KEY, 
idpartido INTEGER NOT NULL, 
idjugador INTEGER NOT NULL, 
created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (idjugador) REFERENCES jugador(id), 
FOREIGN KEY(idpartido) REFERENCES partido(id) );


END; $$