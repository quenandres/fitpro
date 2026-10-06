import { useSearchParams } from 'react-router-dom';
import { SelfTrainingRedirect } from '../../components/training/SelfTrainingRedirect';
import { RoutineCreationChooserView } from '../../components/library/routines/RoutineCreationChooserView';
import { useUsuariosStore } from '../../store/useUsuariosStore';
import { forwardRoutineCreationContext, parseRoutineCreationContext } from '../../utils/routineCreationContext';

export const RoutineChooserPage = () => {
  const [searchParams] = useSearchParams();
  const usuarios = useUsuariosStore((s) => s.usuarios);
  if (searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  const ctx = parseRoutineCreationContext(searchParams);
  const clienteObjetivo = ctx ? usuarios.find((u) => u.id === ctx.usuarioId) : undefined;

  return (
    <RoutineCreationChooserView
      variant="library"
      context={ctx}
      clienteNombre={clienteObjetivo?.nombre}
      libraryForward={(target) => forwardRoutineCreationContext(target, searchParams)}
      showDrafts={!ctx}
    />
  );
};
