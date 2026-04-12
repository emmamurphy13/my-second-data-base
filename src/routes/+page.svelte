<script>
  import Card from '$lib/components/Card.svelte';
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import DropdownInput from '$lib/components/DropdownInput.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import RankingCard from '$lib/components/RankingCard.svelte';
  import RankingList from '$lib/components/RankingList.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';

  let { data } = $props();

  let query = $state('');
  let selectedBorough = $state('');
  let openCategory = $state('');

  const formatNumber = (value) =>
    new Intl.NumberFormat('en-US').format(Number(value) || 0);

  const onBoroughChange = (event) => {
    selectedBorough = event.currentTarget.value;
  };

  const toggleCategory = (borough) => {
    openCategory = openCategory === borough ? '' : borough;
  };

  const filteredRecords = $derived.by(() => {
    const q = query.trim().toLowerCase();

    return data.records.filter((record) => {
      const matchesBorough = selectedBorough ? record.borough === selectedBorough : true;
      const matchesQuery = q
        ? record.location.toLowerCase().includes(q) ||
          record.borough.toLowerCase().includes(q) ||
          record.address.toLowerCase().includes(q)
        : true;

      return matchesBorough && matchesQuery;
    });
  });

  const filteredGroups = $derived.by(() => {
    const map = new Map();

    for (const record of filteredRecords) {
      if (!map.has(record.borough)) map.set(record.borough, []);
      map.get(record.borough).push(record);
    }

    return data.groupedByBorough
      .filter((group) => map.has(group.borough))
      .map((group) => ({
        ...group,
        records: map.get(group.borough),
      }));
  });
</script>

<svelte:head>
  <title>{data.pageTitle} | NYCity News Service</title>
  <meta
    name="description"
    content="Search and filter NYC library branches by program attendance, then drill into branch and borough detail pages."
  />
</svelte:head>

<DatabaseHeader
  headline={data.pageTitle}
  description="A searchable database of branch-level public program attendance, including adult, young adult, juvenile and outreach totals."
  byline={data.byline}
  date={data.updatedDate}
>
  <div class="hero-controls">
    <SearchInput
      label="Search branches"
      placeholder="Try: Bronx Library Center"
      bind:value={query}
    />
    <DropdownInput
      label="Filter by borough"
      options={data.boroughs}
      value={selectedBorough}
      placeholder="All boroughs"
      onchange={onBoroughChange}
    />
  </div>
</DatabaseHeader>

<div class="results-container">
  <div class="borough-links">
    {#each data.groupedByBorough as group (group.boroughSlug)}
      <a class="borough-chip" href={`/borough/${group.boroughSlug}`}>
        {group.borough}
      </a>
    {/each}
  </div>

  <p class="results-summary">
    Showing <strong>{filteredRecords.length}</strong> of <strong>{data.records.length}</strong> branches.
  </p>

  <section class="category-results" aria-label="Filtered category results">
    <h2 class="category-title">Programs by category</h2>
    {#each filteredGroups as group (group.boroughSlug)}
      <div class="category-panel">
        <button
          type="button"
          class="category-toggle"
          aria-expanded={openCategory === group.borough}
          onclick={() => toggleCategory(group.borough)}
        >
          <span>{group.borough} ({group.records.length})</span>
          <span class="chevron">{openCategory === group.borough ? '−' : '+'}</span>
        </button>

        {#if openCategory === group.borough}
          <ul>
            {#each group.records as record (record.slug)}
              <li>
                <a href={`/library/${record.slug}`}>{record.location}</a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </section>

  <div class="cards-grid">
    {#each filteredRecords as record (record.slug)}
      <Card href={`/library/${record.slug}`}>
        <h3>{record.location}</h3>
        <p class="borough-line">{record.borough}</p>

        <p class="metric-row">
          <span>Total attendance</span>
          <strong>{formatNumber(record.attendance)}</strong>
        </p>

        <p class="address">{record.address}</p>

        {#snippet footer()}
          <span>View details →</span>
        {/snippet}
      </Card>
    {/each}
  </div>

  <div class="rankings-wrap">
    <RankingList title="Top 5 branches citywide">
      {#each data.topRanked as record, index (record.slug)}
        <RankingCard
          rank={index + 1}
          href={`/library/${record.slug}`}
          title={record.location}
          description={record.borough}
          value={formatNumber(record.attendance)}
          valueLabel="attendance"
        />
      {/each}
    </RankingList>
  </div>

  <MethodologyBox title="How We Built This Database">
    <p>
      Source data came from branch-level attendance rows in <strong>film-permits.csv</strong>. We removed
      subtotal/system rows, normalized borough and branch names, and converted attendance columns to
      numeric fields.
    </p>
    <p>
      We then generated slugs for each branch and borough to power static detail pages. The search box and
      borough filter run on the client to help readers quickly find individual records or group views.
    </p>
  </MethodologyBox>
</div>

<style lang="scss">
  @use '$lib/styles' as *;

  .hero-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    @include tablet {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-md);
      max-width: 900px;
    }
  }

  .results-container {
    max-width: var(--max-width-wide);
    margin: var(--spacing-lg) auto;
    padding: 0 var(--spacing-md);
  }

  .borough-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  .borough-chip {
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0.25rem 0.75rem;
    text-decoration: none;
    color: var(--color-accent);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
  }

  .results-summary {
    margin: 0 0 var(--spacing-md);
    font-family: var(--font-sans);
  }

  .category-results {
    margin-bottom: var(--spacing-md);
  }

  .category-title {
    margin: 0 0 var(--spacing-xs);
    font-family: var(--font-sans);
    font-size: var(--font-size-lg);
  }

  .category-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-sm);
    background: var(--color-white);
    margin-bottom: var(--spacing-xs);
    padding: 0;

    .category-toggle {
      width: 100%;
      border: 0;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: var(--spacing-xs) var(--spacing-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-accent);
      text-align: left;
    }

    .chevron {
      font-size: var(--font-size-lg);
      line-height: 1;
    }

    ul {
      margin: var(--spacing-xs) 0 0;
      padding: 0 var(--spacing-sm) var(--spacing-sm) 1.5rem;
    }

    li {
      margin-bottom: 0.25rem;
    }

    a {
      color: var(--color-text);
      text-decoration: none;
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--spacing-md);
  }

  .borough-line {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-accent);
    font-weight: var(--font-weight-semibold);
  }

  .metric-row {
    margin: 0;
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-xs);
    align-items: baseline;

    strong {
      color: var(--color-accent);
      font-size: var(--font-size-xl);
    }
  }

  .address {
    margin: var(--spacing-xs) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-medium-gray);
  }

  .rankings-wrap {
    margin-top: var(--spacing-lg);
  }
</style>
