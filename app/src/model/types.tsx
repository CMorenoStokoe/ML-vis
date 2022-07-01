/* Build custom typings so our app knows what properties and values to expect 
   The d3 class DSVRowArray does not know the specific structure of our data,
   but we do and we can use this to typeguard.
*/

// Declare the columns we expect
export type DataColumns = '0' | '1' | 'prediction' | 'timestamp';

// Declare the structure of each row in our data
export interface DataRow {
    '0': number; // Numbered keys coerced to strings so will access these as strings
    '1': number;
    'prediction': string;
    'timestamp': string; // Will convert to Date
}

// Bringing it all together as a type which should exactly match our DSVRowArray from d3
export type DataArray = DataRow[] & {columns: Array<DataColumns>}

// For applying filters
export type DateFilter = {start:string, end:string};
