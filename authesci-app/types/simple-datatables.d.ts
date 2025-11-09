// authesci-app/types/simple-datatables.d.ts
interface DataTableOptions {
  data: {
    headings: any[];
    data: any[][];
  };
  columns: any[];
  rowRender: (row: any, tr: any, _index: any) => any;
  rowNavigation?: boolean; // Add rowNavigation property
  tabIndex?: number; // Add tabIndex property
  // Add other properties as needed
}

interface SimpleDatatables {
  DataTable: new (element: HTMLElement | string, options: DataTableOptions) => any;
  // Add other methods/properties of simpleDatatables if needed
}

interface Window {
  simpleDatatables: SimpleDatatables;
}