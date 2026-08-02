#!/bin/bash
set -e

# Arranca SQL Server en segundo plano
/opt/mssql/bin/sqlservr &

# Espera a que SQL Server esté listo para aceptar conexiones
echo "Esperando a que SQL Server arranque..."
for i in {1..50};
do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" &> /dev/null
    if [ $? -eq 0 ]
    then
        echo "SQL Server está listo."
        break
    fi
    sleep 2
done

# Corre el script de restauración + ALTER TABLE (es seguro correrlo varias veces, es idempotente)
echo "Ejecutando setup.sql (restaurar AdventureWorks si hace falta)..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /usr/src/app/init/setup.sql

echo "Setup completo. SQL Server sigue corriendo en primer plano."

# Mantiene el contenedor vivo, esperando al proceso de SQL Server
wait
