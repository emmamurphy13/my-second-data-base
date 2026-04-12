const BOROUGH_ORDER = ['Bronx', 'Manhattan', 'Brooklyn', 'Queens', 'Staten Island'];

const EXCLUDED_BOROUGHS = new Set(['CENTRAL LIBRARY UNITS', 'Other', 'System']);

const BRANCH_ADDRESSES = {
  'Bronx  Library Center': '310 East Kingsbridge Road, Bronx, NY 10458',
  Parkchester: '1985 Westchester Avenue, Bronx, NY 10462',
  Soundview: '660 Soundview Avenue, Bronx, NY 10473',
  'Mott Haven': '321 East 140th Street, Bronx, NY 10454',
  'Seward Park': '192 East Broadway, New York, NY 10002',
  Ottendorfer: '135 2nd Avenue, New York, NY 10003',
  Inwood: '4790 Broadway, New York, NY 10034',
  'Fort Washington': '535 West 179th Street, New York, NY 10033',
  'Dongan Hills': '1617 Richmond Road, Staten Island, NY 10304',
  'New Dorp': '309 New Dorp Lane, Staten Island, NY 10306',
  'St. George Library Center': '5 Central Avenue, Staten Island, NY 10301',
  'Great Kills': '56 Giffords Lane, Staten Island, NY 10308',
};

export const BOROUGH_CENTERS = {
  Bronx: { longitude: -73.8648, latitude: 40.8448 },
  Manhattan: { longitude: -73.9712, latitude: 40.7831 },
  Brooklyn: { longitude: -73.9442, latitude: 40.6782 },
  Queens: { longitude: -73.7949, latitude: 40.7282 },
  'Staten Island': { longitude: -74.1502, latitude: 40.5795 },
};

const toNumber = (value) => {
  const parsed = Number(value?.trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function parseLibraryAttendanceCsv(csvText) {
  const rows = csvText.trim().split(/\r?\n/);
  const dataRows = rows.slice(1);

  const records = [];
  const byBorough = new Map();

  for (const row of dataRows) {
    const cols = row.split(',');
    if (cols.length < 13) continue;

    const borough = cols[0]?.trim();
    const branch = cols[2]?.trim();

    if (!borough || EXCLUDED_BOROUGHS.has(borough)) continue;
    if (!branch || /subtotal|total/i.test(branch)) continue;

    const record = {
      borough,
      boroughSlug: slugify(borough),
      location: branch,
      attendance: toNumber(cols[12]),
      adultAttendance: toNumber(cols[4]),
      youngAdultAttendance: toNumber(cols[6]),
      juvenileAttendance: toNumber(cols[8]),
      outreachAttendance: toNumber(cols[10]),
      address: BRANCH_ADDRESSES[branch] || 'Address not available in this dataset',
    };

    if (record.attendance <= 0) continue;

    record.slug = slugify(`${borough}-${branch}`);

    records.push(record);

    if (!byBorough.has(borough)) byBorough.set(borough, []);
    byBorough.get(borough).push(record);
  }

  const boroughs = BOROUGH_ORDER.filter((borough) => byBorough.has(borough));

  const groupedByBorough = boroughs.map((borough) => {
    const boroughRecords = (byBorough.get(borough) || []).sort(
      (a, b) => b.attendance - a.attendance,
    );

    return {
      borough,
      boroughSlug: slugify(borough),
      totalAttendance: boroughRecords.reduce((sum, record) => sum + record.attendance, 0),
      records: boroughRecords,
    };
  });

  records.sort((a, b) => b.attendance - a.attendance);

  return {
    records,
    groupedByBorough,
    boroughs,
    totals: {
      branches: records.length,
      attendance: records.reduce((sum, record) => sum + record.attendance, 0),
    },
  };
}
