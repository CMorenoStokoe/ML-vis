import * as d3 from 'd3';
import { useRef, createRef, useEffect, useState } from 'react';
import { DSVRowArray } from 'd3'; // Types ...
import { DataArray, DataRow, DataColumns, DateFilter } from '../../model/types';
import { DateForm } from '../components/buttons';

// Utility helper functions
const getDistinct = (d:Array<string | number>) => d.filter((x, i, a) => a.indexOf(x) == i)
const date = (d:string):Date => {
    const dateAndTime = new Date(d)
    const date = dateAndTime.setHours(0, 0, 0, 0); // Scope of current project is dates not time
    return new Date(date); 
}
const dateToString = (d:string):string => date(d).toString();
const dateToISO = (d:string):string => date(d).toISOString().slice(0, 10);
const getDateRange = (dates:Array<string>):{earliest: string, latest: string} => {
    const sorted = dates.sort((a,b) => date(a) > date(b) ? 1 : -1);
    return({earliest: dateToISO(sorted[0]), latest: dateToISO(sorted[sorted.length-1])})
}

/* If i need to parse time again...
const parseTime = (t:string):Date => {
    console.log(t as unknown as Date)
    const format = d3.timeParse('%d-%m-%Y %H:%M:%S');
    let time:string = t;
    try{ // Try dropping milliseconds if present, otherwise strict d3 time format breaks
        time = t.split('.')[0]
    }finally{
        console.log(time)
        console.log(format( time ))
        return(format( time )!)
    }
}
*/

// Initialise a hook so we can draw and update our graph
export const useD3 = (d3Callback: Function, dependencies:Array<any>) => {
    const ref = useRef(null);

    useEffect(() => {
        console.log('redrawing')
        d3Callback(d3.select(ref.current));
        return () => {};
    }, dependencies);

    return ref;
}

// Visuals
function Graph(props:{
    data: DataRow[];
    activeDateFilter: DateFilter;
}):JSX.Element{
    // If there are any filters, apply them
    const filterByDate = (d:string):boolean => {
        const afterStart = props.activeDateFilter.start ? date(props.activeDateFilter.start) <= date(d) : true;
        const beforeEnd = props.activeDateFilter.end ? date(props.activeDateFilter.end) >= date(d) : true;
        if(afterStart && beforeEnd){
            return true
        } else {
            return false
        }
    }

    const svgRef = useD3(
        (svg:any)=>{

        // Size graph and margins 
        const margin = {top: 50, right: 50, bottom: 50, left: 50}, 
            width = 800 - margin.left - margin.right, 
            height = 600 - margin.top - margin.bottom;

        // Scale SVG
        svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        
        // Scale the x and y axes
        let x = d3.scaleLinear()
            .domain( d3.extent(props.data, d=>+d['0']) as [number, number] )
            .range([0, width])
            .nice();
        let y = d3.scaleLinear()
            .domain(d3.extent(props.data, d=>+d['1']) as [number, number])
            .range([0, height])
            .nice();
      
        // Color each prediction category
        let color:Record<string, string> = {};
        getDistinct( 
            props.data.map(d=>d.prediction) 
        ).forEach((prediction, i) => {
            color[prediction as string] = d3.schemeCategory10[i]
        })

        // Add plots
        let g = svg.append('g') // Top level class containing graph set inside margins
            .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

        g.selectAll('point')
            .data(props.data)
            .enter().append('circle')
            .filter( (d:DataRow) => filterByDate(d.timestamp)) 
            .attr('fill', (d:DataRow) => color[d.prediction])
            .attr('r', 5)
            .attr('cx', (d:DataRow) => x( d['0'] ))
            .attr('cy', (d:DataRow) => y( d['1'] ));
        
        // Add axes
        g.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));
        g.append('g')
            .call(d3.axisLeft(y));

        // Add legend
        let zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', function(event) {
                svg.select('g')
                .attr('transform', event.transform);
            });

        // @ts-ignore 
        svg.call(zoom); // Some type issues need to be worked out

    }, [props.data, Object.entries(props.activeDateFilter)]); // Update on new data

    return(<svg ref={svgRef}/>)
}

export function Visualisation(props:{
    data: {
        live: DataArray;
        reference: DataArray;
    },
    onClick: {
        click: Function
    }
}):JSX.Element{
    const data: DataRow[] = props.data.live.slice();
    const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>({start: '', end: ''});

    /*
    useEffect(() => {
        console.log(activeDateFilter);
        svgRef = drawGraph(d3.select(svgRef.current));
    }, [data, activeDateFilter]);
    */

    return(
        <div>
            <button onClick={()=>{console.log(props.data)}}>Log something</button>
            <DateForm 
                dateRange={getDateRange( data.map(d=>d.timestamp) )}
                activeDateFilter={activeDateFilter}
                onChange={(f:DateFilter)=>{setActiveDateFilter( f )}}
            />
            <Graph data={data} activeDateFilter={activeDateFilter} />
        </div>
    )
}
