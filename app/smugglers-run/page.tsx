import { Suspense } from 'react';
import type { Metadata } from 'next';
import SmugglersRunApp from './SmugglersRunApp';

export const metadata: Metadata = {
  title: "Smuggler's Run — kwiKBio Labs",
  description: 'Two-player desert canyon race. Challenge a friend over WhatsApp — first to the drop point wins.',
};

export default function SmugglersRunPage() {
  return (
    <Suspense>
      <SmugglersRunApp />
    </Suspense>
  );
}
