import { error } from '@sveltejs/kit';

import { BOROUGH_CENTERS, slugify } from '$lib/data/libraryData';
import { getLibraryDataset } from '$lib/server/libraryData';

export function entries() {
  const dataset = getLibraryDataset();

  return dataset.boroughs.map((borough) => ({
    borough: slugify(borough),
  }));
}

export function load({ params }) {
  const dataset = getLibraryDataset();
  const group = dataset.groupedByBorough.find((item) => item.boroughSlug === params.borough);

  if (!group) {
    throw error(404, 'Borough group not found');
  }

  return {
    showHeader: true,
    showFooter: true,
    group,
    boroughCenter: BOROUGH_CENTERS[group.borough] || null,
    updatedDate: 'Updated April 2026',
  };
}
