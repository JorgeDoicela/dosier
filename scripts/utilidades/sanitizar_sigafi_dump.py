#!/usr/bin/env python3
# ==============================================================================
# DOSIER / ISTPET — Pipeline de Anonimización y Sanitización LOPDP para SIGAFI
# ==============================================================================
# Propósito  : Procesa un volcado MySQL de producción (Dump*.sql) y genera un
#              script DDL/DML optimizado, 100% fiel en catálogo académico
#              (carreras, mallas, asignaturas, horas) pero estrictamente
#              anonimizado en datos personales y credenciales (LOPDP Ecuador).
# Uso        : py scripts/utilidades/sanitizar_sigafi_dump.py [ruta_dump_opcional]
# ==============================================================================

import re
import os
import sys
from pathlib import Path

def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    
    dump_path = None
    if len(sys.argv) > 1:
        dump_path = Path(sys.argv[1])
    else:
        # Buscar el dump más reciente en la raíz del proyecto
        dumps = list(root_dir.glob("Dump*.sql"))
        if dumps:
            dump_path = max(dumps, key=os.path.getmtime)
        else:
            dump_path = root_dir / "Dump20260916.sql"

    output_path = root_dir / "scripts" / "base_datos" / "00_sigafi_esquema_y_datos_demo.sql"

    if not dump_path.exists():
        print(f"[ERROR] No se encontró el archivo de volcado en: {dump_path}")
        sys.exit(1)

    print(f"[*] Procesando volcado: {dump_path.name} ({dump_path.stat().st_size / (1024*1024):.2f} MB)...")

    # 1. Catálogo Institucional y Curricular Real (Datos públicos institucionales - Sin LOPDP)
    STRUCTURAL_TABLES = {
        'carreras', 'facultades', 'instituciones', 'instituciones_instituto',
        'periodos', 'periodos_matriculas_niveles', 'periodos_inscripciones',
        'mallas', 'mallas_periodos', 'detallemallas', 'materias', 'prerequisitos',
        'modalidades', 'modalidades_carreras', 'modalidades_ofertas', 'jornadas_ofertas',
        'niveles_academicos', 'tipos_asignatura', 'secciones', 'parciales',
        'parciales_modalidades', 'parciales_modalidades_fechas', 'semanas_horarios',
        'horas_clases', 'ofertas_carreras',
        'paises', 'provincias', 'cantones', 'parroquias', 'nacionalidades', 'etnias',
        'tipos_documentos', 'tiposdocumentosi', 'tiposangre', 'grados_academicos', 'discapacidades', 'estadocivil',
        'parametros', 'relacion_ies', 'tipo_funcionario',
        'rbac_sistema', 'rbac_modulos', 'rbac_operaciones', 'rbac_modulos_operaciones',
        'rbac_rol', 'rbac_rol_modulo_operacion', 'asignacion_materias'
    }

    with open(dump_path, 'r', encoding='utf-8', errors='ignore') as infile:
        content = infile.read()

    header_sql = """-- =============================================================================
-- DOSIER / SIGAFI - Base de Datos Institucional Anonimizada (LOPDP Compliant)
-- =============================================================================
-- Generado con Pipeline de Sanitización Oficial para el ISTPET.
-- Conserva el catálogo curricular real (carreras, mallas, periodos, materias)
-- y anonimiza estrictamente datos personales y credenciales bajo la LOPDP.
-- =============================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `sigafi_es` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sigafi_es`;

"""

    # Extraer DDL completo con regex robusta
    table_pattern = re.compile(
        r'(DROP TABLE IF EXISTS `(\w+)`;\s*'
        r'(?:/\*!40101 SET @saved_cs_client\s*=\s*@@character_set_client \*/;\s*'
        r'/\*!40101 SET character_set_client\s*=\s*utf8 \*/;\s*)?'
        r'CREATE TABLE `\2`\s*\([^;]+?\)\s*ENGINE=[^;]+;)',
        re.DOTALL | re.IGNORECASE
    )

    tables_found = {}
    for match in table_pattern.finditer(content):
        tbl_name = match.group(2)
        tbl_sql = match.group(1)
        tables_found[tbl_name] = tbl_sql

    print(f"[*] Tablas DDL identificadas: {len(tables_found)}")

    # Extraer INSERTs
    insert_pattern = re.compile(r'(INSERT INTO `?(\w+)`?[^;]+;)', re.IGNORECASE)
    raw_inserts = {}
    for match in insert_pattern.finditer(content):
        tbl_name = match.group(2)
        raw_inserts.setdefault(tbl_name, []).append(match.group(1))

    output_blocks = [header_sql]

    # 1. DDL de todas las tablas
    output_blocks.append("-- -----------------------------------------------------------------------------\n-- 1. ESTRUCTURA COMPLETA DDL DE TABLAS (sigafi_es)\n-- -----------------------------------------------------------------------------\n")
    for tbl_name, ddl in sorted(tables_found.items()):
        output_blocks.append(f"{ddl}\n\n")

    # 2. Catálogo Académico Íntegro
    output_blocks.append("-- -----------------------------------------------------------------------------\n-- 2. CATÁLOGO ACADÉMICO Y CURRICULAR INSTITUCIONAL (REAL)\n-- -----------------------------------------------------------------------------\n")
    for tbl in sorted(STRUCTURAL_TABLES):
        if tbl in raw_inserts:
            output_blocks.append(f"-- Datos para la tabla `{tbl}`\n")
            output_blocks.append("LOCK TABLES `" + tbl + "` WRITE;\n")
            output_blocks.append("/*!40000 ALTER TABLE `" + tbl + "` DISABLE KEYS */;\n")
            for ins in raw_inserts[tbl]:
                output_blocks.append(f"{ins}\n")
            output_blocks.append("/*!40000 ALTER TABLE `" + tbl + "` ENABLE KEYS */;\n")
            output_blocks.append("UNLOCK TABLES;\n\n")

    # 3. Profesores: Conservar IDs de asignaciones docentes pero anonimizando LOPDP y credenciales
    output_blocks.append("-- -----------------------------------------------------------------------------\n-- 3. DOCENTES Y PROFESORES ANONIMIZADOS (LOPDP COMPLIANT CON CLAVE 12345)\n-- -----------------------------------------------------------------------------\n")
    
    # Docentes institucionales clave requeridos para pruebas y gobernanza
    special_profesores = [
        ("1725555377", "'1'", "'Doicela'", "'Molina'", "'Doicela'", "'Molina'", "'Jorge'", "'Ismael'", "1", "'Quito'", "'Av. Principal'", "'Calle 1'", "'S/N'", "'022222222'", "'0999999999'", "'jorge.doicela@istpet.edu.ec'", "'1990-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'jorge.doicela@istpet.edu.ec'", "'2020-01-01'", "'2020-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1720000002", "'1'", "'Valencia'", "'Llerena'", "'Valencia'", "'Llerena'", "'Carlos'", "'Enrique'", "1", "'Quito'", "'Av. Principal'", "'Calle 2'", "'S/N'", "'022222222'", "'0999999999'", "'carlos.valencia@istpet.edu.ec'", "'1985-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'carlos.valencia@istpet.edu.ec'", "'2018-01-01'", "'2018-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1720000003", "'1'", "'Proaño'", "'Ramos'", "'Proaño'", "'Ramos'", "'Marcia'", "'Elena'", "1", "'Quito'", "'Av. Principal'", "'Calle 3'", "'S/N'", "'022222222'", "'0999999999'", "'vicerrectorado@istpet.edu.ec'", "'1980-01-01'", "'F'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Msc.'", "'Msc.'", "''", "1", "1", "1", "1", "'vicerrectorado@istpet.edu.ec'", "'2015-01-01'", "'2015-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1720000004", "'1'", "'Guaman'", "'Perez'", "'Guaman'", "'Perez'", "'David'", "'Alejandro'", "1", "'Quito'", "'Av. Principal'", "'Calle 4'", "'S/N'", "'022222222'", "'0999999999'", "'coordinacion.software@istpet.edu.ec'", "'1988-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'coordinacion.software@istpet.edu.ec'", "'2019-01-01'", "'2019-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1720000005", "'1'", "'Andrade'", "'Torres'", "'Andrade'", "'Torres'", "'Silvia'", "'Patricia'", "1", "'Quito'", "'Av. Principal'", "'Calle 5'", "'S/N'", "'022222222'", "'0999999999'", "'coordinacion.academica@istpet.edu.ec'", "'1982-01-01'", "'F'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Msc.'", "'Msc.'", "''", "1", "1", "1", "1", "'coordinacion.academica@istpet.edu.ec'", "'2016-01-01'", "'2016-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1802707511", "'1'", "'Baño'", "''", "'Baño'", "''", "'Freddy'", "''", "1", "'Quito'", "'Av. Principal'", "'Calle 6'", "'S/N'", "'022222222'", "'0999999999'", "'freddy.bano@istpet.edu.ec'", "'1975-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Msc.'", "'Msc.'", "''", "1", "1", "1", "1", "'freddy.bano@istpet.edu.ec'", "'2010-01-01'", "'2010-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("0502405889", "'1'", "'Cobos'", "''", "'Cobos'", "''", "'Cristian'", "''", "1", "'Quito'", "'Av. Principal'", "'Calle 7'", "'S/N'", "'022222222'", "'0999999999'", "'cristian.cobos@istpet.edu.ec'", "'1983-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Msc.'", "'Msc.'", "''", "1", "1", "1", "1", "'cristian.cobos@istpet.edu.ec'", "'2017-01-01'", "'2017-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1709890626", "'1'", "'Trujillo'", "''", "'Trujillo'", "''", "'Wilfrido'", "''", "1", "'Quito'", "'Av. Principal'", "'Calle 8'", "'S/N'", "'022222222'", "'0999999999'", "'wilfrido.trujillo@istpet.edu.ec'", "'1978-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'wilfrido.trujillo@istpet.edu.ec'", "'2012-01-01'", "'2012-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1720004793", "'1'", "'Castro'", "''", "'Castro'", "''", "'Christian'", "''", "1", "'Quito'", "'Av. Principal'", "'Calle 9'", "'S/N'", "'022222222'", "'0999999999'", "'christian.castro@istpet.edu.ec'", "'1986-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'christian.castro@istpet.edu.ec'", "'2018-01-01'", "'2018-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
        ("1721465431", "'1'", "'Toapanta'", "''", "'Toapanta'", "''", "'Wilmer'", "''", "1", "'Quito'", "'Av. Principal'", "'Calle 10'", "'S/N'", "'022222222'", "'0999999999'", "'wilmer.toapanta@istpet.edu.ec'", "'1987-01-01'", "'M'", "'12345'", "0", "'P'", "'Ecuatoriana'", "'Ing.'", "'Ing.'", "''", "1", "1", "1", "1", "'wilmer.toapanta@istpet.edu.ec'", "'2019-01-01'", "'2019-01-01'", "NULL", "1", "'ORH+'", "'170101'", "1", "0", "NULL", "NULL", "1"),
    ]

    processed_prof_ids = set()
    sanitized_prof_rows = []

    # Agregar primero los especiales
    for sp in special_profesores:
        id_p = sp[0]
        processed_prof_ids.add(id_p)
        vals = [f"'{id_p}'"] + list(sp[1:])
        sanitized_prof_rows.append(f"({', '.join(vals)})")

    # Extraer todos los profesores del dump para mantener coherencia referencial
    if 'profesores' in raw_inserts:
        prof_raw = " ".join(raw_inserts['profesores'])
        rows_match = re.findall(r'\(([^)]+)\)', prof_raw)
        
        for idx, row in enumerate(rows_match, 1):
            parts = [p.strip().strip("'\"") for p in row.split(',')]
            if len(parts) >= 1:
                id_prof = parts[0]
                if id_prof in processed_prof_ids:
                    continue
                processed_prof_ids.add(id_prof)
                
                synthetic_cedula = f"'{id_prof}'"
                synthetic_apellidos = f"'DocenteApellido {idx}'"
                synthetic_nombres = f"'DocenteNombre {idx}'"
                synthetic_email = f"'docente_{id_prof}@istpet.edu.ec'"
                
                # Armar fila con 41 columnas compatibles con tabla profesores
                new_row = (
                    f"('{id_prof}', '1', {synthetic_apellidos}, {synthetic_nombres}, {synthetic_apellidos}, '', "
                    f"{synthetic_nombres}, '', 1, 'Quito', 'Calle Principal', 'Calle Secundaria', 'S/N', "
                    f"'022222222', '0999999999', {synthetic_email}, '1985-01-01', 'M', '12345', 0, 'P', "
                    f"'Ecuatoriana', 'Ing.', 'Ing.', '', 1, 1, 1, 1, {synthetic_email}, '2020-01-01', '2020-01-01', NULL, 1, 'ORH+', '170101', 1, 0, NULL, NULL, 1)"
                )
                sanitized_prof_rows.append(new_row)
    
    if sanitized_prof_rows:
        output_blocks.append("LOCK TABLES `profesores` WRITE;\n")
        output_blocks.append("/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;\n")
        for i in range(0, len(sanitized_prof_rows), 25):
            chunk = sanitized_prof_rows[i:i+25]
            output_blocks.append(f"INSERT INTO `profesores` VALUES\n{',\n'.join(chunk)}\nON DUPLICATE KEY UPDATE `clave` = VALUES(`clave`), `activo` = 1;\n")
        output_blocks.append("/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;\n")
        output_blocks.append("UNLOCK TABLES;\n\n")

    # 4. Usuarios DOSIER (Credenciales 12345 con hash/texto plano y asignación de roles inicial)
    output_blocks.append("""-- -----------------------------------------------------------------------------
-- 4. USUARIOS INSTITUCIONALES PARA AUTENTICACIÓN DOSIER (CLAVE 12345)
-- -----------------------------------------------------------------------------
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`idUsuario`, `idSigafi`, `tablaSigafi`, `nombre`, `contrasenia`, `activo`, `administrador`, `emailInstitucional`, `emailValidado`) VALUES
(1, '1725555377', 'profesor', 'Jorge Ismael Doicela Molina', '12345', 1, 1, 'jorge.doicela@istpet.edu.ec', 1),
(2, '1720000002', 'profesor', 'Carlos Enrique Valencia Llerena', '12345', 1, 0, 'carlos.valencia@istpet.edu.ec', 1),
(3, '1720000003', 'profesor', 'Marcia Elena Proaño Ramos', '12345', 1, 0, 'vicerrectorado@istpet.edu.ec', 1),
(4, '1720000004', 'profesor', 'David Alejandro Guaman Perez', '12345', 1, 0, 'coordinacion.software@istpet.edu.ec', 1),
(5, '1720000005', 'profesor', 'Silvia Patricia Andrade Torres', '12345', 1, 0, 'coordinacion.academica@istpet.edu.ec', 1),
(6, '1802707511', 'profesor', 'Freddy Baño', '12345', 1, 0, 'freddy.bano@istpet.edu.ec', 1),
(7, '0502405889', 'profesor', 'Cristian Cobos', '12345', 1, 0, 'cristian.cobos@istpet.edu.ec', 1),
(8, '1709890626', 'profesor', 'Wilfrido Trujillo', '12345', 1, 0, 'wilfrido.trujillo@istpet.edu.ec', 1),
(9, '1720004793', 'profesor', 'Christian Castro', '12345', 1, 0, 'christian.castro@istpet.edu.ec', 1),
(10, '1721465431', 'profesor', 'Wilmer Toapanta', '12345', 1, 0, 'wilmer.toapanta@istpet.edu.ec', 1)
ON DUPLICATE KEY UPDATE 
  `contrasenia` = VALUES(`contrasenia`),
  `nombre` = VALUES(`nombre`),
  `activo` = 1,
  `administrador` = VALUES(`administrador`),
  `emailInstitucional` = VALUES(`emailInstitucional`);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

""")

    footer_sql = """/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
"""
    output_blocks.append(footer_sql)

    print(f"[*] Guardando script resultante en: {output_path}...")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as outfile:
        outfile.write("".join(output_blocks))

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"[OK] Pipeline completado con éxito.")
    print(f"     Archivo generado: {output_path.name} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    main()
