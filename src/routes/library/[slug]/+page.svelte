<script>
  import { base } from '$app/paths';
  import BigNumber from '$lib/components/BigNumber.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import LocatorMap from '$lib/components/LocatorMap.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import RelatedLinks from '$lib/components/RelatedLinks.svelte';

  let { data } = $props();

  const formatNumber = (value) =>
    new Intl.NumberFormat('en-US').format(Number(value) || 0);
</script>

<svelte:head>
  <title>{data.record.location} | NYC Library Database</title>
  <meta
    name="description"
    content={`Program attendance profile for ${data.record.location} in ${data.record.borough}.`}
  />
</svelte:head>

<DatabaseHeader
  headline={data.record.location}
  description={`Branch profile for ${data.record.borough}. Use this page to review total attendance and age-group breakdowns.`}
  byline="By Emma Murphy, NYCity News Service"
  date={data.updatedDate}
/>

<div class="page-container">
  <p class="kicker">
    <a href={`${base}/borough/${data.record.boroughSlug}`}>{data.record.borough}</a> / {data.record.address}
  </p>

  <Dashboard>
    <BigNumber number={formatNumber(data.record.attendance)} label="Total attendance" />
    <BigNumber number={formatNumber(data.record.adultAttendance)} label="Adult programs" />
    <BigNumber number={formatNumber(data.record.youngAdultAttendance)} label="Young adult programs" />
    <BigNumber number={formatNumber(data.record.juvenileAttendance)} label="Juvenile programs" />
  </Dashboard>

  {#if data.boroughCenter}
    <div class="map-wrap">
      <LocatorMap
        longitude={data.boroughCenter.longitude}
        latitude={data.boroughCenter.latitude}
        zoom={10}
        dot={true}
        caption={`${data.record.location} is listed under ${data.record.borough} in this dataset.`}
      />
    </div>
  {/if}

  <MethodologyBox>
    <p>
      Attendance values are drawn directly from the source CSV and reflect the totals published for this
      branch in the assignment dataset.
    </p>
    <p>
      Records were cleaned by removing subtotal/system rows and converting attendance columns to numbers.
    </p>
  </MethodologyBox>

  <RelatedLinks
    title="More records"
    links={[
      { headline: `View all ${data.record.borough} branches`, href: `${base}/borough/${data.record.boroughSlug}` },
      { headline: 'Back to full searchable list', href: base || '/' },
    ]}
  />
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .page-container {
    max-width: var(--max-width-wide);
    margin: var(--spacing-lg) auto;
    padding: 0 var(--spacing-md);
  }

  .kicker {
    margin: 0;
    font-family: var(--font-sans);
    color: var(--color-medium-gray);

    a {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: var(--font-weight-semibold);
    }
  }

  .map-wrap {
    margin-top: var(--spacing-md);
    max-width: 360px;
  }
</style>
