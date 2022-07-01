import * as d3 from 'd3';
import { useRef, createRef, useEffect } from 'react';
import { DSVRowArray } from 'd3'; // Types ...
import { DataArray, DataRow } from '../../model/types';

function visualiseData(props:{
    data: {
        live: DSVRowArray;
        reference: DSVRowArray;
    },
    onClick: {
        click: Function
    }
}):JSX.Element{
    

    return(
        <div></div>
    )
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
    // First perform a simple check to see if the local data was properly loaded 
    if(!props.data){alert('Error: Data loading failed.')};

    // Initialise 
    let svgRef = useRef(null); // null will be replaced with our visualisation

    // Select data for visualisation
    //let data:DataArray = props.data.live
    let data:DataRow[] = props.data.live.slice(0,100);

    // Get unique predictions for colouring
    let color:Record<string, string> = {};
    data.map(d=>d.prediction).filter((x, i, a) => a.indexOf(x) == i).forEach((prediction, i) => {
        color[prediction as string] = d3.schemeCategory10[i]
    })

    // Visualise data
    useEffect(() => {
        // Size graph and margins 
        let margin = {top: 50, right: 50, bottom: 50, left: 50}, 
            width = 800 - margin.left - margin.right, 
            height = 600 - margin.top - margin.bottom;

        // Initialise SVG
        let svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        
        // Scale the x and y axes
        let x = d3.scaleLinear()
            .domain( d3.extent(data, d=>+d['0']) as [number, number] )
            .range([0, width])
            .nice();
        let y = d3.scaleLinear()
            .domain(d3.extent(data, d=>+d['1']) as [number, number])
            .range([0, height])
            .nice();
      
        // Add plots
        let g = svg.append('g') // Top level class containing graph set inside margins
            .attr('transform',
            'translate(' + margin.left + ',' + margin.top + ')');

        g.selectAll('point')
            .data(data)
            .enter().append('circle')
            .filter( d => d3.parseTime(d.timestamp) < }) 
            .attr('fill', d => color[d.prediction])
            .attr('r', 5)
            .attr('cx', d => x( d['0'] ))
            .attr('cy', d => y( d['1'] ));
        
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

    }, [data]); // Update on new data

    return(
        <div>
            <button onClick={()=>{console.log(props.data)}}>Log something</button>
            <svg className='' ref={svgRef}/>
        </div>
    )
}
