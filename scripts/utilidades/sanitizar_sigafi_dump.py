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
        'paises', 'provincias', 'cantones', 'parroquias', 'nacionalidades',
        'tipos_documentos', 'tiposdocumentosi', 'tiposangre', 'grados_academicos',
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

    # Extraer DDL completo
    table_pattern = re.compile(r'(DROP TABLE IF EXISTS `?(\w+)`?;.*?CREATE TABLE `?\2`? \((?:.(?!\n\s*\n|\n--))*?\)\s*ENGINE=[^;\n]+;)', re.DOTALL | re.IGNORECASE)
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

    # 3. Profesores Anonimizados
    output_blocks.append("-- -----------------------------------------------------------------------------\n-- 3. DOCENTES Y PROFESORES ANONIMIZADOS (LOPDP COMPLIANT)\n-- -----------------------------------------------------------------------------\n")
    if 'profesores' in raw_inserts:
        prof_raw = " ".join(raw_inserts['profesores'])
        rows_match = re.findall(r'\(([^)]+)\)', prof_raw)
        
        sanitized_prof_rows = []
        for idx, row in enumerate(rows_match, 1):
            parts = [p.strip() for p in row.split(',')]
            if len(parts) >= 6:
                id_prof = parts[0]
                synthetic_cedula = f"'1790{int(id_prof):06d}'" if id_prof.isdigit() else f"'1790{idx:06d}'"
                synthetic_apellidos = f"'DocenteApellido {id_prof}'"
                synthetic_nombres = f"'DocenteNombre {id_prof}'"
                synthetic_email = f"'docente_{id_prof}@istpet.edu.ec'"
                new_row = f"({id_prof}, {synthetic_cedula}, {synthetic_nombres}, {synthetic_apellidos}, 'M', '1985-01-01', 'Soltero/a', 'Ecuatoriana', 'Quito', '0999999999', {synthetic_email}, 1, 1, 1, '12345', 1)"
                sanitized_prof_rows.append(new_row)
        
        if sanitized_prof_rows:
            output_blocks.append("LOCK TABLES `profesores` WRITE;\n")
            output_blocks.append("/*!40000 ALTER TABLE `profesores` DISABLE KEYS */;\n")
            for i in range(0, len(sanitized_prof_rows), 50):
                chunk = sanitized_prof_rows[i:i+50]
                output_blocks.append(f"INSERT IGNORE INTO `profesores` VALUES {', '.join(chunk)};\n")
            output_blocks.append("/*!40000 ALTER TABLE `profesores` ENABLE KEYS */;\n")
            output_blocks.append("UNLOCK TABLES;\n\n")

    # 4. Usuarios de Prueba para Roles DOSIER
    output_blocks.append("""-- -----------------------------------------------------------------------------
-- 4. USUARIOS INSTITUCIONALES ANONIMIZADOS PARA ROLES DE DOSIER
-- -----------------------------------------------------------------------------
LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT IGNORE INTO `usuarios` (`idUsuario`, `usuario`, `password`, `nombre`, `apellido`, `email`, `idRol`, `esActivo`) VALUES
(1, 'admin_dosier', '$2a$11$N4fP0jYk2Cq5Yj6UuE1k7uRzL5ZfX1G9B3wQ2rT4vP7mK0sJ8hI2y', 'Administrador', 'Curricular ISTPET', 'admin.dosier@istpet.edu.ec', 1, 1),
(2, 'docente_demo', '$2a$11$N4fP0jYk2Cq5Yj6UuE1k7uRzL5ZfX1G9B3wQ2rT4vP7mK0sJ8hI2y', 'Docente', 'Elaborador ISTPET', 'docente.demo@istpet.edu.ec', 2, 1),
(3, 'coord_carrera', '$2a$11$N4fP0jYk2Cq5Yj6UuE1k7uRzL5ZfX1G9B3wQ2rT4vP7mK0sJ8hI2y', 'Coordinador', 'Desarrollo de Software', 'coord.software@istpet.edu.ec', 3, 1),
(4, 'coord_academico', '$2a$11$N4fP0jYk2Cq5Yj6UuE1k7uRzL5ZfX1G9B3wQ2rT4vP7mK0sJ8hI2y', 'Comisión', 'Académica ISTPET', 'coord.academica@istpet.edu.ec', 4, 1),
(5, 'vicerrector', '$2a$11$N4fP0jYk2Cq5Yj6UuE1k7uRzL5ZfX1G9B3wQ2rT4vP7mK0sJ8hI2y', 'Vicerrector', 'Académico ISTPET', 'vicerrectorado@istpet.edu.ec', 5, 1);
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
