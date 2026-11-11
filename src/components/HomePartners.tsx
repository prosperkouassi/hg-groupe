import { connection } from 'next/server';
import { getPartners } from '@/lib/partners';
import PartnerGrid from '@/components/PartnerGrid';

export default async function HomePartners() {
  await connection();
  let partners;
  try {
    partners = await getPartners(true);
  } catch (error) {
    // Keep the home page available while the migration is being installed.
    console.error('Chargement des partenaires :', error);
    return null;
  }
  // No invented client references before the first publication.
  if (!partners.length) return null;
  return <PartnerGrid partners={partners} />;
}
