import React, { useEffect, useState } from 'react'; // Core react functionality
import * as d3 from 'd3'; // d3
import './App.css'; // Style
// import {} from './model/types'; // Types ...
import { DSVRowArray } from 'd3';
import { DataArray } from './model/types';
import {Splash} from './templates/views/splash'; // Templates ...
import {Visualisation} from './templates/views/visualisation';
import {GenericError} from './templates/views/genericError';
import refDataPath from './model/data/refData.csv'; // Filepaths...
import liveDataPath from './model/data/liveData.csv';
/* Note: Local file paths are dynamic for build/server deployment (using webpack file-loader)  */

// Main app model
function App() {
  // Set up the variables we will use to control the app
  const [view, setView] = useState<'splash' | 'visualisation'>('splash'); // Current view
  const [data, setData] = useState<Record<'live' | 'reference', DataArray >>();  // Our data
  
// Start by getting data from local csv files
useEffect(() => {
  // Use promises & d3 svg functions to parse local data
    Promise.all([
      d3.csv(liveDataPath),
      d3.csv(refDataPath),
    ]).then(function(bothDataSets) {
        // Save data with a more specific typing than d3's generic DSVRowArray (see types.tsx)
        setData({
          live: bothDataSets[0] as unknown as DataArray, 
          reference: bothDataSets[1] as unknown as DataArray
        });
    }).catch(function(err) {
        alert(`Error getting data from CSV \n ${err}`) // Would not use alert() in production
    })
    /* Note: With truly live data we would repeat this function when new data is available 
    by changing the second parameter [] */
}, []);

  const currentView = ():JSX.Element => {
    switch(view){
      case 'splash' : return(
        <Splash onClick={{ continue:()=>{ setView('visualisation' )} }}/>
      );
      case 'visualisation' : return(
        <Visualisation 
          data={data!} // Coerce undefined typing with !
          onClick={{ click: ()=>{} }} />
      );
      default : return(<GenericError/>)
    }
  }

  return (
    <div className="App">
      <header className="m-2 p-2 font-red-500 font-arima font-bold"> ML diagnostic visualisation demo </header>
      {currentView()}
    </div>
  );
}

export default App;
