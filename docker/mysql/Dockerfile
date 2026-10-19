# Base de datos del SIM para Railway (se construye desde la raíz del repositorio).
# Lleva dentro los scripts de Backend/database y los carga la primera vez que arranca.
FROM mysql:8.4
COPY Backend/database /scripts-sim
COPY docker/cargar-base.sh /docker-entrypoint-initdb.d/cargar-base.sh
# --lower-case-table-names=1: igual que MySQL en Windows (Hibernate consulta las tablas en minúscula).
# --datadir en una subcarpeta: el volumen de Railway puede traer la carpeta lost+found, y MySQL
#   se niega a inicializar una carpeta que no está vacía.
CMD ["mysqld", "--lower-case-table-names=1", "--datadir=/var/lib/mysql/datos"]
