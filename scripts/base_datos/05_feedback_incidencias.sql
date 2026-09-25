-- =============================================================================
-- DOSIER: SISTEMA DE GESTION CURRICULAR (PEA - ISTPET)
-- Script 05: Modulo de Soporte, Feedback e Incidencias del Sistema
-- Prefijo Oficial: doc_*
-- =============================================================================

CREATE TABLE IF NOT EXISTS `doc_feedback_reportes` (
  `idFeedback` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `nombreUsuario` varchar(255) NOT NULL,
  `rolUsuario` varchar(50) NOT NULL,
  `tipo` varchar(30) NOT NULL DEFAULT 'SUGERENCIA', -- SUGERENCIA | ERROR | DUDA
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `rutaOrigen` varchar(255) DEFAULT NULL,
  `archivosAdjuntosJson` json DEFAULT NULL,
  `conversacionJson` json DEFAULT NULL,
  `estado` varchar(30) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | EN_REVISION | ATENDIDO | DESCARTADO
  `observacionAdmin` text DEFAULT NULL,
  `fechaCreacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaActualizacion` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFeedback`),
  UNIQUE KEY `uq_doc_feedback_uuid` (`uuid`),
  KEY `idx_doc_feedback_usuario` (`idUsuario`),
  KEY `idx_doc_feedback_tipo` (`tipo`),
  KEY `idx_doc_feedback_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
