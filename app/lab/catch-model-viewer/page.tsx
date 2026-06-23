import type { Metadata } from 'next';
import CatchModelViewer from './CatchModelViewer';

/**
 * /lab/catch-model-viewer — a TEMPORARY, internal lab route.
 *
 * Read-only proof that the Catch / SafeOps Object Model v1.2 works. Not linked
 * from navigation and marked noindex; intended to be extracted into the
 * dedicated catch-safeops-prototype repo before any public portfolio URL
 * references it (see tracking issue #4).
 */
export const metadata: Metadata = {
  title: 'Catch / SafeOps — Model Proof Viewer (lab)',
  description:
    'Internal, read-only proof of the Catch / SafeOps Object Model v1.2. Temporary lab route.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CatchModelViewer />;
}
