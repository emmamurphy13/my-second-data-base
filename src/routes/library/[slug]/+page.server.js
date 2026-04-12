import { error } from '@sveltejs/kit';

import { BOROUGH_CENTERS } from '$lib/data/libraryData';
import { getLibraryDataset } from '$lib/server/libraryData';

export function entries() {
  const dataset = getLibraryDataset();
  return dataset.records.map((record) => ({ slug: record.slug }));
}

export function load({ params }) {
  const dataset = getLibraryDataset();
  const record = dataset.records.find((item) => item.slug === params.slug);

  if (!record) {
    throw error(404, 'Library record not found');
  }

  const boroughGroup = dataset.groupedByBorough.find((group) => group.borough === record.borough);

  return {
    showHeader: true,
    showFooter: true,
    record,
    boroughGroup,
    boroughCenter: BOROUGH_CENTERS[record.borough] || null,
    updatedDate: 'Updated April 2026',
  };
}
