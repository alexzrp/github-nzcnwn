import React, { useMemo, useState } from 'react';
import MaterialReactTable, {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_FilterOption,
  MRT_PaginationState,
  MRT_SortingState,
} from 'material-react-table';
import { IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';

type ArtigoApiResponse = {
  data: Array<Artigo>;
  meta: {
    total: number;
  };
};

type Artigo = {
  id: number;
  title: string;
};

const Example = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [columnFilterFns, setColumnFilterFns] = useState<{
    [key: string]: MRT_FilterOption;
  }>({
    title: 'contains',
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isFetched, isError, isFetching, isLoading, refetch } =
    useQuery<ArtigoApiResponse>({
      queryKey: [
        'table-data',
        columnFilters, //refetch when columnFilters changes
        globalFilter, //refetch when globalFilter changes
        pagination.pageIndex, //refetch when pagination.pageIndex changes
        pagination.pageSize, //refetch when pagination.pageSize changes
        sorting, //refetch when sorting changes
      ],
      queryFn: async () => {
        const fetchURL = new URL(
          '/api/artigos',
          'https://api.qa.uqbaronline.com'
        );
        fetchURL.searchParams.set(
          'pagination[start]',
          `${pagination.pageIndex * pagination.pageSize}`
        );
        fetchURL.searchParams.set(
          'pagination[offset]',
          `${pagination.pageSize}`
        );
        /*fetchURL.searchParams.set(
          'filters',
          JSON.stringify(columnFilters ?? [])
        );*/
        console.log(columnFilters, columnFilterFns);
        //fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
        //fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

        const response = await fetch(fetchURL.href);
        const json = (await response.json()) as ArtigoApiResponse;
        return json;
      },
      keepPreviousData: true,
    });

  const columns = useMemo<MRT_ColumnDef<Artigo>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'title',
        header: 'TITULO',
        filterFn: 'contains',
        columnFilterModeOptions: ['contains', 'startsWith'],
      },
    ],
    []
  );

  if (!isFetched || !data?.data) return null;
  return (
    <MaterialReactTable
      columns={columns}
      data={data?.data ?? []} //data is undefined on first render
      initialState={{ showColumnFilters: true }}
      manualFiltering
      manualPagination
      manualSorting
      enableColumnFilterModes
      muiToolbarAlertBannerProps={
        isError
          ? {
              color: 'error',
              children: 'Error loading data',
            }
          : undefined
      }
      onColumnFiltersChange={setColumnFilters}
      onColumnFilterFnsChange={setColumnFilterFns}
      onGlobalFilterChange={setGlobalFilter}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      renderTopToolbarCustomActions={() => (
        <Tooltip arrow title="Refresh Data">
          <IconButton onClick={() => refetch()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
      rowCount={data?.meta?.pagination?.total ?? 0}
      state={{
        columnFilters,
        columnFilterFns,
        globalFilter,
        isLoading,
        pagination,
        showAlertBanner: isError,
        showProgressBars: isFetching,
        sorting,
      }}
    />
  );
};

const queryClient = new QueryClient();

const ExampleWithReactQueryProvider = () => (
  <QueryClientProvider client={queryClient}>
    <Example />
  </QueryClientProvider>
);

export default ExampleWithReactQueryProvider;
