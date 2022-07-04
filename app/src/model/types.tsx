/* Build custom typings so our app knows what properties and values to expect 
   The d3 class DSVRowArray does not know the specific structure of our data,
   but we do and we can use this to typeguard.
*/

// Declare the columns we expect
export type DataColumns = '0' | '1' | 'prediction' | 'timestamp';

// Raw data types
export interface RawDataRow {
    '0': number;
    '1': number;
    'prediction': string;
    'timestamp': string | Date;
}

// Data filters
export type Filters = {
    date:{
        active: boolean;
        value: Date;
    };
    prediction:{
        active: boolean;
        value: string;
    };
}
export type DataWithFilters = {
    all: DataRow[];
    means: DataRow[];
    byPrediction: Record<string, DataRow[]>;
    byDate: Record<string, DataRow[]>;
    byPredictionAndDate: Record<string, Record<string, DataRow[]>>;
}
export type RefWithFilters = {
    all: RefRow[];
    means: RefRow[];
    byPrediction: Record<string, RefRow[]>;
}

// Processed data types
export interface DataRow {
    '0': number; // Numbered keys coerced to strings so will access these as strings
    '1': number;
    'prediction': string;
    'timestamp': Date;
}
export interface RefRow {
    '0': number;
    '1': number;
    'label': string;
}
export interface DataBundle {
    live: DataWithFilters;
    ref: RefWithFilters;
}
export interface DataView {
    live: DataRow[];
    ref: RefRow[];
}
export interface DataPoint {
    '0': number;
    '1': number;
    'prediction': string;
    ref: boolean;
};

// Tooltip on graph
export type TooltipInfo = {
    show:boolean;
    d: DataPoint;
    pos:{x:number, y:number};
}