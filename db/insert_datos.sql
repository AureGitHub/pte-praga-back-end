BEGIN TRANSACTION;

delete from jugador_confirmar;
delete from partidoxjugador;
delete from jugador_confirmar;
delete from partido;
delete from jugador;
delete from jugador_estado;
delete from perfil;
delete from posicion;


insert into posicion (descripcion) 
    values('drive');
insert into posicion (descripcion) 
    values('reves');

insert into perfil (descripcion) 
    values('admin');
insert into perfil (descripcion) 
    values('jugador');

insert into jugador_estado (descripcion) 
    values('debe confirmar email');
insert into jugador_estado (descripcion) 
    values('debe cambiar password');
insert into jugador_estado (descripcion) 
    values('bloquado');
insert into jugador_estado (descripcion) 
    values('activo');


insert into partido_estado (descripcion) 
    values('abierto');
insert into partido_estado (descripcion) 
    values('cerrado');
    insert into partido_estado (descripcion) 
    values('finalizado');


insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('aure1','J. Aurelio de Sande','aure@gmail.es','$2a$10$x4KulBC1xzSts.IT7lBCxe2THfZVsfNaZz0drdQWLKaV1yEhpE8fm',1,2,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('victor','Victor Ordas','victor@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',1,1,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('luis','Luis Moro' ,'luis@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',1,1,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('fer','Fernando valle','fer@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,1,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('j.Fonseca','Jesus Fonseca','fonseca@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('j.Rebollo','Jesus Rebollo','rebollo@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,1,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('angel11','Angel apellido1' ,'angel@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);
insert into jugador (alias, nombre, email,passwordhash,idperfil,idposicion, idestado)
    values('andres','Andres apellido1' ,'andres@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);


COMMIT;