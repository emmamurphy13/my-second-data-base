<script>
  import { base } from '$app/paths';
  import Card from '$lib/components/Card.svelte';
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import LocatorMap from '$lib/components/LocatorMap.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';

  let { data } = $props();

  const formatNumber = (value) =>
    new Intl.NumberFormat('en-US').format(Number(value) || 0);
</script>

<svelte:head>
  <title>{data.group.borough} | NYC Library Database</title>
  <meta
    name="description"
    content={`All branch attendance records for ${data.group.borough}.`}
  />
</svelte:head>

<DatabaseHeader
  headline={`${data.group.borough} branch attendance`}
  description="Compare attendance totals across branches in this borough and open each branch record for a full profile."
  byline="By Emma Murphy, NYCity News Service"
  date={data.updatedDate}
/>

<div class="group-container">
  <p class="summary">
    <strong>{data.group.records.length}</strong> branches in this borough with a combined
    <strong> {formatNumber(data.group.totalAttendance)} </strong> attendance.
  </p>

  {#if data.boroughCenter}
    <div class="map-wrap">
      <LocatorMap
        longitude={data.boroughCenter.longitude}
        latitude={data.boroughCenter.latitude}
        zoom={10}
        dot={true}
        caption={`${data.group.borough} map overview.`}
      />
    </div>
  {/if}

  <div class="cards-grid">
    {#each data.group.records as record (record.slug)}
      <Card href={`${base}/library/${record.slug}`}>
        <h3>{record.location}</h3>
        <p class="metric">Total attendance: <strong>{formatNumber(record.attendance)}</strong></p>
        <p class="address">{record.address}</p>
      </Card>
    {/each}
  </div>

  <MethodologyBox>
    <p>
      Borough totals are computed by summing all branch attendance values after cleanup.
    </p>
    <p>
      <a href={base || '/'}>Return to the searchable citywide index</a> to compare boroughs side by side.
    </p>
  </MethodologyBox>
</div>

<style lang="scss">
  .group-container {
    max-width: var(--max-width-wide);
    margin: var(--spacing-lg) auto;
    padding: 0 var(--spacing-md);
  }

  .summary {
    margin: 0 0 var(--spacing-md);
    font-family: var(--font-sans);
  }

  .map-wrap {
    margin-bottom: var(--spacing-md);
    max-width: 360px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }

  .metric {
    margin: 0;
  }

  .address {
    margin: var(--spacing-xs) 0 0;
    color: var(--color-medium-gray);
    font-size: var(--font-size-sm);
  }
</style>
