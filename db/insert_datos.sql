BEGIN TRANSACTION;

delete from jugador_confirmar;
delete from partidoxjugador;
delete from jugador_confirmar;
delete from partido;
delete from jugador;
delete from jugador_estado;
delete from perfil;
delete from posicion;


insert into posicion values(1,'drive');
insert into posicion values(2,'reves');

insert into perfil values(1,'admin');
insert into perfil values(2,'jugador');

insert into jugador_estado values(1,'debe confirmar email');
insert into jugador_estado values(2,'debe cambiar password');
insert into jugador_estado values(3,'bloquado');
insert into jugador_estado values(4,'activo');

insert into jugador values(1,'aure1','J. Aurelio de Sande','aure@gmail.es','$2a$10$x4KulBC1xzSts.IT7lBCxe2THfZVsfNaZz0drdQWLKaV1yEhpE8fm',1,2,4);
insert into jugador values(2,'victor','Victor Ordas','victor@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',1,1,4);
insert into jugador values(3,'luis','Luis Moro' ,'luis@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',1,1,4);
insert into jugador values(4,'fer','Fernando valle','fer@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,1,4);
insert into jugador values(5,'j.Fonseca','Jesus Fonseca','fonseca@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);
insert into jugador values(6,'j.Rebollo','Jesus Rebollo','rebollo@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,1,4);
insert into jugador values(7,'angel11','Angel apellido1' ,'angel@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);
insert into jugador values(8,'andres','Andres apellido1' ,'andres@gmail.es','$2a$10$8NoNcCLdWBteqRhhzPRsDeE.CrsZBjpEcSE5kSYOqdPgK/kfWPN4S',2,2,4);


COMMIT;