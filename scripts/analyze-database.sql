-- SCRIPT DE ANÁLISIS DE BASE DE DATOS ASTROFARM
-- =============================================

-- 1. Listar todas las tablas y su estado de RLS
PRINT '=== TABLAS Y ESTADO DE RLS ===';
SELECT 
    schemaname as "Schema",
    tablename as "Tabla",
    CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESHABILITADO' END as "RLS",
    (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = t.tablename) as "Políticas"
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Estructura de cada tabla
PRINT '=== ESTRUCTURA DE TABLAS ===';
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Claves foráneas
PRINT '=== RELACIONES ENTRE TABLAS ===';
SELECT
    tc.table_name as "Tabla",
    kcu.column_name as "Columna",
    ccu.table_name AS "Tabla Referenciada",
    ccu.column_name AS "Columna Referenciada"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. Permisos actuales
PRINT '=== PERMISOS POR TABLA ===';
SELECT 
    tablename,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
    AND grantee IN ('anon', 'authenticated', 'service_role')
GROUP BY tablename, grantee
ORDER BY tablename, grantee;

-- 5. Contar registros en cada tabla
PRINT '=== CONTEO DE REGISTROS ===';
DO $$
DECLARE
    r RECORD;
    count_result INTEGER;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename)
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', r.tablename) INTO count_result;
        RAISE NOTICE '% : % registros', r.tablename, count_result;
    END LOOP;
END $$;

-- 6. Verificar si existe la tabla farms
PRINT '=== VERIFICACIÓN TABLA FARMS ===';
SELECT 
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'farms'
    ) as "Tabla farms existe";

-- 7. Si existe farms, mostrar su estructura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'farms'
ORDER BY ordinal_position;
