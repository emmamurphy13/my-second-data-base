import { getLibraryDataset } from '$lib/server/libraryData';

export function load() {
  const dataset = getLibraryDataset();

  return {
    showHeader: true,
    showFooter: true,
    pageTitle: 'NYC Library Program Attendance Explorer',
    byline: 'By Emma Murphy, NYCity News Service',
    updatedDate: 'Updated April 2026',
    records: dataset.records,
    boroughs: dataset.boroughs.map((borough) => ({
      value: borough,
      label: borough,
    })),
    groupedByBorough: dataset.groupedByBorough,
    topRanked: dataset.records.slice(0, 5),
    totals: dataset.totals,
  };
}
