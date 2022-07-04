import * as d3 from 'd3';
import React, { useRef, createRef, useEffect, useState, createElement } from 'react';
import { DataRow, TooltipInfo, Filters, RefRow, DataBundle, DataView, DataPoint } from '../../model/types';
import { DateSlider, Btn, Toggle, Dropdown } from '../components/controls'; // Components ...
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faFilter, faHandFist, faArrowPointer, faCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleOutline } from '@fortawesome/free-regular-svg-icons';

// Initialise a hook so we can draw and update our graph
export const useScatterplot = (drawScatterFn: Function, dependencies:Array<any>) => {
    const ref = useRef(null);
    useEffect(() => {
        drawScatterFn(d3.select(ref.current));
        return () => {};
    }, dependencies);

    return ref;
}

// Build tooltip element
const Tooltip = (props:{
    colors: Record<string, string>;
    t:TooltipInfo;
}):JSX.Element => {
    // Format tooltip with Tailwind classes
    const className = 'absolute' // This will appear at mouse coords on the page
    + ' p-1 bg-black text-white rounded' // Design
    + ' text-xs'
    + ' transition' // Animate changes
    + ' pointer-events-none' // Smooths tooltip selection
    
    return(
        <div className={className} style={{
            left: `${props.t.pos.x}px`, 
            top: `${props.t.pos.y + 25}px`,
            opacity: props.t.show ? 1 : 0
        }}>
            <p className='font-bold' style={{color: props.colors[props.t.d.prediction]}}>
                <FontAwesomeIcon icon={faLightbulb}/>
                {props.t.d.prediction}
            </p>
            <p>{Number(props.t.d[0]).toFixed(1)}</p>
            <p>{Number(props.t.d[1]).toFixed(1)}</p>
            <p>{props.t.d.ref ? 'Reference data' : 'Observed data'}</p>
        </div>
    )
}

// Visuals
const Graph = (props:{
    currentDataView: DataView;
    filters: Filters;
    range: {'0':{min:number,max:number}; '1':{min:number,max:number}};
    colors:Record<string, string>;
}):JSX.Element => {
    // Combine data
    const data:DataPoint[] = props.currentDataView.ref.map((d)=>{return{ 
        '0':d['0'], '1':d['1'], prediction:d.label, ref:true 
        }}).concat(
            props.currentDataView.live.map((d)=>{return{ 
                '0':d['0'], '1':d['1'], prediction:d.prediction, ref:false 
            }})
    )

    const [tooltip, setTooltip] = useState<TooltipInfo>({show:false, d:{'0':0, '1':0, 'prediction':'', ref:true}, pos:{x:0,y:0}});
    // Draw graph
    const svgRef = useScatterplot(
        (svg:any)=>{
        
        // Size graph and margins 
        const margin = {top: 20, right: 50, bottom: 50, left: 50}, 
            width = 800 - margin.left - margin.right, 
            height = 600 - margin.top - margin.bottom;

        // Scale SVG
        svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)

        // Scale the x and y axes
        let x = d3.scaleLinear()
            .domain( [props.range['0'].min, props.range['0'].max] )
            .range([0, width])
            .nice();
        let y = d3.scaleLinear()
            .domain( [props.range['1'].max, props.range['1'].min]  )
            .range([0, height])
            .nice();

        // Add plots
        let g = svg.select('.plot-area') // Top level class containing graph set inside margins
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        let update = g.selectAll('circle')
            .data(data, function (d:DataPoint) { return (d:DataPoint) => d });

        let enter = update.enter()
            .append('circle');

        let exit = update.exit().remove();

        enter
            .attr('class', (d:DataPoint) => `${d.prediction.replace(' ','_')} ${d.ref ? 'ref' : 'live'}`)
            .attr('fill', (d:DataPoint) => d.ref===true ? 'white' : props.colors[d.prediction])
            .attr('stroke', (d:DataPoint) => d.ref===true ? 'black' : 'none')
            .attr('r', (d:DataPoint) => {
                if(d.ref) return 2
                else return props.currentDataView.live.length < 50 ? 10 : 2
            })
            .attr('cx', (d:DataPoint) => x( d['0'] ))
            .attr('cy', (d:DataPoint) => y( d['1'] ))
            // Tooltips
            .on('mouseover', (e:MouseEvent,d:DataPoint) => {
                g.selectAll('circle').style('opacity', '.15');
                g.selectAll(`circle.${d.ref ? 'ref' : 'live'}`).style('opacity', '1');
                setTooltip({ show:true, d:d, pos:{x: e.pageX, y: e.pageY} })
            })
            .on('mouseout',  (e:MouseEvent,d:DataPoint) => {
                g.selectAll('circle').style('opacity', '1');
                setTooltip({ show:false, d:d, pos:{x: e.pageX, y: e.pageY} })
            });
        exit.remove();
        update.merge(enter);
        
        // Add axes
        g.selectAll('.x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x));
        g.selectAll('.y-axis')
            .call(d3.axisLeft(y));
        g.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'end')
            .attr('x', width / 1.85 )
            .attr('y', height + 40 )
            .text('Dimension 0');
        g.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'end')
            .attr('y', width - 260)
            .attr('x', -height/2.5)
            .attr('dy', -width / 1.5)
            .attr('transform', 'rotate(-90)')
            .text('Dimension 1');

        // Add legend
        let zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', function(event) {
                svg.select('g')
                    .attr('transform', event.transform);
            });

        svg.call(zoom);

        console.log( g.selectAll('circle').size() );

    }, [props.currentDataView.live.length]); // Update on new data

    return(
        <div className='graph'>
            <Tooltip colors={props.colors} t={tooltip} />
            <svg ref={svgRef}>
                <g className='plot-area'>
                    <g className='x-axis' />
                    <g className='y-axis' />
                </g>
            </svg>
            <div className='tooltip' />
        </div>
    )
}

export function Visualisation(props:{
    currentDataView: DataView;
    categoriesInData:{'dates':Date[]; 'predictions': string[]};
    filters: Filters;
    onSelectNewFilter: (f:Filters)=>void;
    range: {'0':{min:number,max:number}; '1':{min:number,max:number}};
}):JSX.Element{

    // Handles user enabling filters
    const handleEnableFilter = (type:'date' | 'prediction', e:boolean) => {
        const f:Filters =  {...props.filters, [type]:{...props.filters[type], active: e}};
        props.onSelectNewFilter(f);
    }
    
    // Handles user selecting filters to apply
    const selectFilterHandler = (f:Filters):void => {
        props.onSelectNewFilter(f);
    }

    // Auto-title the graph
    const title = ():string => {
        if(props.filters.date.active && props.filters.prediction.active) return 'Model performance by date and category';
        if(props.filters.prediction.active) return 'Model performance by category';
        if(props.filters.date.active) return 'Model performance by date';
        else return 'Mean model performance against reference';
    }

    // Color each prediction category
    const colors:Record<string, string> = {};
    const categoryColorScheme = d3.schemeSpectral[ props.categoriesInData.predictions.length ];
    props.categoriesInData.predictions.forEach((prediction, i) => {
        colors[prediction as string] = categoryColorScheme[i];
    });

    return(
        <div className='h-auto flex flex-row'>
            <div className='flex flex-col justify-start items-center'>
                <p className='m-2 font-display font-bold text-3xl text-center'>{title()}</p>
                <div>
                    Model predictions = <FontAwesomeIcon icon={faCircle} className='pr-2 text-accent-hue'/>
                    Reference labels = <FontAwesomeIcon icon={faCircleOutline} className='text-black'/>
                </div>
                <Graph currentDataView={props.currentDataView} filters={props.filters} range={props.range}  colors={colors} />
            </div>
            <div className='p-4 w-full flex flex-col justify-start shadow bg-primary-hue'>
                <p className='font-display font-bold text-3xl'>Filters</p>
                <div className='flex flex-row items-center'>
                    <Toggle label='Filter by prediction' value='prediction' 
                        onChange={ handleEnableFilter } />
                    <Dropdown
                        filters={ props.filters }
                        options={ props.categoriesInData.predictions }
                        onChange={ selectFilterHandler }
                        colors={ colors }
                    /> 
                </div>
                <div className='flex flex-row  items-center'>
                    <Toggle label='Filter by prediction and date' value='date' 
                        onChange={ handleEnableFilter } disabled={ !props.filters.prediction.active } />
                    <DateSlider
                        filters={ props.filters }
                        dateRange={ props.categoriesInData.dates }
                        onChange={ selectFilterHandler  }
                    /> 
                </div>
                <small className='text-primary-shade'><FontAwesomeIcon icon={faArrowPointer} /> Hint: Drag and scroll to pitch and zoom</small>
            </div>
        </div>
    )
}
