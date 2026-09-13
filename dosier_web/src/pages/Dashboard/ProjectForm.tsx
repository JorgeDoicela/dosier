import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProjectFormData {
  titulo: string;
  resumen: string;
  lineaInvestigacion: string;
}

const ProjectForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (_data: ProjectFormData) => {
    setIsSubmitting(true);
    alert('Postulación enviada correctamente (Simulado)');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bento-card p-8">
        <h3 className="text-2xl font-bold text-text-main mb-6">Registro de Instrumento Curricular</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="section-label text-text-dim" style={{ marginBottom: '0.5rem' }}>Título del Instrumento / Asignatura</label>
            <input
              {...register('titulo', { required: 'El título es obligatorio' })}
              className="input-vercel"
              placeholder="Ej. Programa de Estudio de la Asignatura (PEA)..."
            />
            {errors.titulo && <p className="text-[10px] text-error font-mono mt-1">{errors.titulo.message}</p>}
          </div>

          <div>
            <label className="section-label text-text-dim" style={{ marginBottom: '0.5rem' }}>Área / Campo del Conocimiento</label>
            <select
              {...register('lineaInvestigacion', { required: 'Selecciona una línea' })}
              className="input-vercel"
            >
              <option value="">Seleccionar...</option>
              <option value="TIC">Tecnologías de Información</option>
              <option value="INN">Innovación y Pedagogía</option>
              <option value="MAE">Gestión y Administración</option>
            </select>
            {errors.lineaInvestigacion && <p className="text-[10px] text-error font-mono mt-1">{errors.lineaInvestigacion.message}</p>}
          </div>

          <div>
            <label className="section-label text-text-dim" style={{ marginBottom: '0.5rem' }}>Resumen Curricular</label>
            <textarea
              {...register('resumen', { required: 'El resumen es obligatorio' })}
              rows={4}
              className="input-vercel"
              placeholder="Breve descripción del alcance curricular..."
            />
            {errors.resumen && <p className="text-[10px] text-error font-mono mt-1">{errors.resumen.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-vercel-primary w-full"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Instrumento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;