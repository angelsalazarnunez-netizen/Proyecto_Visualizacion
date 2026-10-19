#!/bin/bash
# Carga los scripts de Backend/database en orden la primera vez que se crea la base.
# Se saltan los scripts de limpieza (nombre con "Limpieza"), que solo se corren a mano.
set -e
for archivo in $(ls /scripts-sim/*.sql | sort); do
  case "$(basename "$archivo")" in
    *Limpieza*) echo "Se omite $archivo"; continue ;;
  esac
  echo "Cargando $archivo"
  mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" < "$archivo"
done
