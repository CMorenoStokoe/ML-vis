import React, { useEffect, useState } from 'react'; // Core react functionality
import * as d3 from 'd3'; // d3
import './App.css'; // Style
import { DSVRowArray } from 'd3'; // Types ...
import { Filters, DataRow, DataBundle, RefRow, RawDataRow, DataView } from './model/types';
import {Splash} from './templates/views/splash'; // Components ...
import {Visualisation} from './templates/views/visualisation';
import {GenericError} from './templates/views/genericError';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import refDataPath from './model/data/refData.csv'; // Filepaths...
import liveDataPath from './model/data/liveData.csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
// Note: Local file paths are dynamic for build/server deployment (using webpack file-loader)

// Main app model
const App = () => {
    // Set up the variables we will use to control the app
    const [view, setView] = useState<'splash' | 'visualisation'>('splash'); // Current view
    const [data, setData] = useState<DataBundle>();  // Our data
    const [currentDataView, setCurrentDataView] = useState<DataView>();  // Our data
    const [categoriesInData, setCategoriesInData] = useState<{'dates':Date[]; 'predictions': string[]}>(); // Categories for filtering
    const [range, setRange] = useState<{'0':{min:number,max:number}; '1':{min:number,max:number}}>(); // Maximum values for constant axes
    const [filters, setFilters] = useState<Filters>(); // Used to select data filters)

    // Start by getting data from local csv files
    useEffect(() => {
        // Use promises & d3 svg functions to parse local data
            Promise.all([
                d3.csv(liveDataPath),
                d3.csv(refDataPath),
            ]).then((dataSets: DSVRowArray[]) => {
                processData(dataSets)
            }).catch(function(err) {
                console.log('CRITICAL ERR: Failed to get data from CSV. Message:' + err) // Would throw error in a meaningful way in production
            })
            // Note: With truly live data we would repeat this useEffect when new data is available repeat this function when new data is available 
    }, []);

    // Process data
    const processData = (dataSets:DSVRowArray[]) => {
        // Tell ts what types to expect (specific structure for d3's generic DSVRowArray, see types.tsx)
        const rawLiveData:RawDataRow[] = dataSets[0] as unknown as RawDataRow[];
        const refData:RefRow[] = dataSets[1] as unknown as RefRow[];

        // Convert time stamps in live data to Dates
        const liveData:DataRow[] = [];
            rawLiveData.forEach( (d:RawDataRow) => {
                d.timestamp = new Date(
                    new Date(d.timestamp as string) // Convert to date
                    .setHours(0, 0, 0, 0) // We only want the dates
                );
                liveData.push(d as DataRow);
            });

        // Pre-filter and set data
        const prefiltered = preFilter(liveData, refData);
        setData(prefiltered);

        // Aggregate categories in data for use in filters
        const predictions = Object.keys(prefiltered.live.byPrediction);
        const dates = Object.keys(prefiltered.live.byDate).map(d => new Date(d));
        setCategoriesInData({
            predictions: predictions,
            dates: dates
        });
        setFilters({ // Used to select data filters
            date: {active: false, value: dates[0]},
            prediction: {active: false, value: predictions[0]}
        });

        // Get maximums for graph axes 
        const live0range = d3.extent(liveData, d=>+d['0']) as [number, number];
        const live1range = d3.extent(liveData, d=>+d['1']) as [number, number];
        const ref0range = d3.extent(refData, d=>+d['0']) as [number, number];
        const ref1range = d3.extent(refData, d=>+d['1']) as [number, number];
        setRange({
            '0':{min: Math.min(live0range[0],ref0range[0]), max: Math.max(live0range[1],ref0range[1])},
            '1':{min: Math.min(live1range[0],ref1range[0]), max: Math.max(live1range[1],ref1range[1])}
        })
    }

    const preFilter = (data:DataRow[], ref:RefRow[]):DataBundle => {
        // Improve performance by pre-filtering data, reducing calculations as user interacts with vis
        const filteredByPrediction: Record<string, DataRow[]> = {};
        const filteredByPredictionAndDate: Record<string, Record<string, DataRow[]>> = {};
        const filteredByDate:Record<string, DataRow[]> = {};
        const refFilteredByPrediction:Record<string, RefRow[]> = {};

        // Filter live data
        for(const row of data){
            // Select data by prediction
            const prediction:string = row.prediction;
            switch(filteredByPrediction[prediction]){
                case undefined: {
                    filteredByPrediction[prediction] = [row];
                    filteredByPredictionAndDate[prediction] = {};
                    filteredByPrediction[prediction] = [row]; 
                    break;
                } 
                default:  filteredByPrediction[prediction].push(row);
            }
            // Select data by date 
            const date:string = row.timestamp!.toISOString().slice(0, 10);
            switch(filteredByDate[date]){
                case undefined: filteredByDate[date] = [row]; break;
                default:  filteredByDate[date].push(row);
            }
            // Select data by prediction and date
            switch(filteredByPredictionAndDate[prediction][date]){
                case undefined: filteredByPredictionAndDate[prediction][date] = [row]; break;
                default: filteredByPredictionAndDate[prediction][date].push(row);
            }
        }

        // Filter ref data
        for(const row of ref){
            // Select data by prediction
            const prediction:string = row.label;
            switch(refFilteredByPrediction[prediction]){
                case undefined: refFilteredByPrediction[prediction] = [row]; break;
                default: refFilteredByPrediction[prediction].push(row);
            }
        }

        // Means for first impressions
        const means:DataRow[] = [];
        for(const [prediction, values] of Object.entries(filteredByPrediction)){
            const sum0 = values.reduce((result:number, nextItem:DataRow) => result + Number(nextItem['0']), 0);
            const sum1 = values.reduce((result:number, nextItem:DataRow) => result + Number(nextItem['1']), 0);
            means.push({
                '0': sum0 / values.length,
                '1': sum1 / values.length,
                prediction: prediction,
                timestamp: new Date()
            })
        }
        const refMeans:RefRow[] = [];
        for(const [label, values] of Object.entries(refFilteredByPrediction)){
            const sum0 = values.reduce((result:number, nextItem:RefRow) => result + Number(nextItem['0']), 0);
            const sum1 = values.reduce((result:number, nextItem:RefRow) => result + Number(nextItem['1']), 0);
            refMeans.push({
                '0': sum0 / values.length,
                '1': sum1 / values.length,
                label: label
            })
        }

        const preFilteredData = {
            live: {
                all: data,
                means: means,
                byPrediction: filteredByPrediction,
                byDate: filteredByDate,
                byPredictionAndDate: filteredByPredictionAndDate
            },
            ref:{
                all: ref,
                means: refMeans,
                byPrediction: refFilteredByPrediction,
            }
        };
        return(preFilteredData)
    }

    // Handles applying filters to the data
    const applyFilterHandler = ():void => {
        const f:Filters = filters!;

        // Get filters
        const prediction:string = f.prediction.value;
        const date:string = f.date.value.toISOString().slice(0, 10);

        // Apply filters
        let filteredData:DataRow[] = [];           
        let filteredRefData:RefRow[] = [];

        const applyFilters = ():DataRow[] => {
            if(f.prediction.active && f.date.active) return data!.live.byPredictionAndDate[prediction][date]
            if(f.prediction.active ) return data!.live.byPrediction[prediction]
            if(f.prediction.active ) return data!.live.byDate[date]
            else return data!.live.means
        }
        const applyRefFilters = ():RefRow[] => {
            if(f.prediction.active) return data!.ref.byPrediction[prediction]
            else return data!.ref.means
        }
        try{ 
            filteredData = applyFilters();
            filteredRefData = applyRefFilters();
        }
        catch(err) { console.log('Error applying filters', err)} 
        finally { 
            if(filteredData !== undefined && filteredRefData !== undefined ){
                // Set filtered data as current data view
                setCurrentDataView({
                    live: filteredData,
                    ref: filteredRefData
                });
            } else {
                setCurrentDataView({
                    live: [],
                    ref: []
                });
                toast("No data for this date range, try another date.");
            }
            console.log('Got new data with filter(s): ', filteredData, filteredRefData, prediction, date);
        }
    }

    // Get new data once a filter is selected
    useEffect(() => {        
        if(data===undefined) return // Only start once data is loaded
        applyFilterHandler();
    }, [data, filters])

    const currentView = ():JSX.Element => {
        switch(view){
            case 'splash': return( <Splash onContinue={()=>{ setView('visualisation' )}}/> );
            case 'visualisation': return(
                <Visualisation currentDataView={currentDataView!}  // Coerce undefined typing with !
                    categoriesInData={categoriesInData!} range={ range! }
                    filters={filters!} onSelectNewFilter={setFilters}/>
            );
            default : return(<GenericError/>);
        }
    }

    return (
        <div className='App h-full font-main'>
            <header className='w-full p-4 flex flex-row justify-between items-center font-bold text-white bg-primary-shade'>
                <p className='p-2 font-display text-4xl font-bold text-white'>
                    ML-vis
                    <span className='pl-2 text-lg font-light font-main'>by 
                    <a className='pl-1 text-blue-200 hover:text-blue-400' href='https://www.morenostok.io/' target='_blank'> 
                    Chris Moreno-Stokoe</a></span>
                </p>
                <ToastContainer /> 
                <a className='p-2 px-3 bg-accent-hue text-lg text-white shadow rounded-xl hover:text-black hover:bg-primary-hue'
                href='https://github.com/CMorenoStokoe/ML-vis' target='_blank'>
                    <FontAwesomeIcon icon={faGithub}/> Code
                </a>
            </header>
            {currentView()}
        </div>
    );
}

export default App;
