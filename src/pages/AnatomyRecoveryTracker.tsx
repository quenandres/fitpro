import { AnatomyViewer, type AnatomyViewerProps } from '../components/anatomy';

/**
 * Página `/anatomytracker`. Es un wrapper fino sobre `AnatomyViewer`; toda la
 * lógica vive dentro de `src/components/anatomy`.
 */
export default function AnatomyRecoveryTracker(props: AnatomyViewerProps) {
  return <AnatomyViewer {...props} />;
}
