-- Este script es IDEMPOTENTE: se puede correr muchas veces sin romper nada,
-- porque cada paso revisa primero si ya se hizo antes de intentar hacerlo.

-- 1. Restaurar la base solo si todavía no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AdventureWorks')
BEGIN
    RESTORE DATABASE AdventureWorks
    FROM DISK = '/var/opt/mssql/backup/AdventureWorks2025.bak'
    WITH MOVE 'AdventureWorks' TO '/var/opt/mssql/data/AdventureWorks.mdf',
         MOVE 'AdventureWorks_log' TO '/var/opt/mssql/data/AdventureWorks_log.ldf';
END
GO

-- 2. Agregar columna Email solo si no existe ya
IF NOT EXISTS (
    SELECT * FROM AdventureWorks.INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'Purchasing' AND TABLE_NAME = 'Vendor' AND COLUMN_NAME = 'Email'
)
BEGIN
    ALTER TABLE AdventureWorks.Purchasing.Vendor ADD Email NVARCHAR(256) NULL;
END
GO

-- 3. Agregar columna Password solo si no existe ya
IF NOT EXISTS (
    SELECT * FROM AdventureWorks.INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'Purchasing' AND TABLE_NAME = 'Vendor' AND COLUMN_NAME = 'Password'
)
BEGIN
    ALTER TABLE AdventureWorks.Purchasing.Vendor ADD Password NVARCHAR(60) NULL;
END
GO

-- 4. Crear el índice único filtrado solo si no existe ya
IF NOT EXISTS (
    SELECT * FROM AdventureWorks.sys.indexes WHERE name = 'UQ_Vendor_Email'
)
BEGIN
    SET QUOTED_IDENTIFIER ON;
    EXEC AdventureWorks..sp_executesql N'CREATE UNIQUE INDEX UQ_Vendor_Email ON Purchasing.Vendor(Email) WHERE Email IS NOT NULL';
END
GO
