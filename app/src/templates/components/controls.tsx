import React, {ChangeEventHandler, createRef, Ref, useEffect, useState} from 'react';
import * as d3 from 'd3';
import ReactSlider from 'react-slider'; // Components ...
import { DataView, Filters } from '../../model/types'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faFilter } from '@fortawesome/free-solid-svg-icons';


export const Btn = (props:{
    text: any;
    onClick: Function;
    accent?: true | undefined;
}):JSX.Element => {
    return(
        <button 
            className={'m-2 p-2 rounded-xl font-arima font-bold text-white hover:-hue-rotate-90 bg-' 
                + (props.accent ? 'primary-hue' : 'accent-hue')}
            onClick={()=>{props.onClick()}}
        >
            {props.text}
        </button>
    )
}

export const DateSlider = (props:{
    filters: Filters;
    dateRange:Date[]; 
    onChange: (f:Filters)=>void;
}):JSX.Element => {
    const ref:Ref<HTMLInputElement> = createRef();
    const [value, setValue] = useState<number>(0);
    const [userHasInteracted, setUserHasInteracted] = useState<boolean>(false);
    const setDateFilter = () => {
        const payload:Filters = {...props.filters, date:{...props.filters.date, value:sortedDateRange[value]}};
        props.onChange(payload);
    }

    // Sort dates to present in a scale from earliest to latest 
    const sortedDateRange = props.dateRange.sort((a,b) => a > b ? 1 : -1);

    // Apply filters on change
    useEffect(()=>{
        setDateFilter()
    }, [value])

    return(
        <div className='w-full p-4 flex flex-col justify-center items-center'>
            <p className='p-4 pl-0 font-bold  pointer-events-none'>Selected: {sortedDateRange[value].toISOString().slice(0, 10)}</p>
            <ReactSlider
                className='my-2 mx-6 w-full'
                marks
                markClassName='h-1/2 w-auto p-1 border-4 border-white bg-primary-shade rounded-full translate -translate-x-1/2 -translate-y-1/2'
                min={0}
                max={sortedDateRange.length-1}
                thumbClassName='h-3/4 w-auto p-2 border-4 border-white bg-accent-hue hover:bg-primary-shade hover:shadow rounded-full translate -translate-x-1/2 -translate-y-1/2 transition-all'
                trackClassName='h-1/4 w-auto p-1 rounded-xl bg-white translate -translate-y-1/2'
                onAfterChange={(v)=>{ setUserHasInteracted(true); setValue(v); }}
            />
            <div className='pt-2 w-full relative flex flex-row justify-between  pointer-events-none'>
                <p>{sortedDateRange[0].toISOString().slice(0, 10)}</p>
                <p>{sortedDateRange[sortedDateRange.length-1].toISOString().slice(0, 10)}</p>
            </div>
        </div>
    )
}

export function Dropdown(props:{
    filters: Filters;
    options: string[];
    onChange: (f:Filters)=>void;
    colors:Record<string, string>;
}):JSX.Element{
    const [value, setValue] = useState<string>(props.options[0]);
    const setPredictionFilter = () => {
        const payload:Filters = {...props.filters, prediction:{ ...props.filters.prediction, value:value }};
        props.onChange(payload);
    }

    // Apply filters on change
    useEffect(()=>{
        setPredictionFilter();
    }, [value])

    return(
        <div>
            <label>
                <select value={value} className='p-2 border rounded font-bold' style={{background:props.colors[value]}}
                    onChange={(e:React.ChangeEvent<HTMLSelectElement>)=>{
                        setValue(e.target.value); 
                    }}>
                    {props.options.map(o =>
                        <option value={o} key={'opt_'+o} style={{background:props.colors[o]}}>{o}</option> 
                    )}
                </select>
            </label>
        </div>
    )
}

export function Toggle(props:{
    label: string;
    value: 'date' | 'prediction';
    onChange: (type: 'date' | 'prediction', e:boolean)=>void;
    disabled?: boolean;
}):JSX.Element{
    const [checked, setChecked] = useState<boolean>(false);
    return(
        <label className='p-4'>
            <p className='font-display font-bold'>{props.label}</p>
            <div className={'p-2 flex flex-row items-center ' + (props.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : '' )}>
                <p className={'p-2  pointer-events-none ' + (checked ? '' : ' font-bold')}>Off</p>
                <div className='w-24 h-12 p-1 relative'>                
                    <input className='w-full h-full absolute top-0 invisible pointer-events-none' type='checkbox' checked={checked}
                        onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{
                            props.onChange(props.value, !checked);
                            setChecked(!checked);
                        }} disabled={props.disabled}/> 
                    <span className='w-full h-full p-2 bg-gray-200 shadow-inner absolute top-0 rounded-full'/>
                    <span className={'w-1/2 h-full absolute top-0 bg-accent-hue rounded-full transition-all hover:bg-accent-hue transform translate ' + (checked ? 'translate-x-full saturate-100 hover:saturate-0 ' : 'translate-x-0 saturate-0 hover:saturate-100 ')}>
                        <FontAwesomeIcon icon={faFilter} className='w-1/2 h-1/2 absolute top-1/4 left-1/4  text-accent-hue'/>
                        <FontAwesomeIcon icon={faFilter} className={ 'w-1/2 h-1/2 absolute top-1/4 left-1/4  text-white transition-all ' + (checked ? 'animate-pulse' : '')} />
                    </span>
                </div>
            <p className={'p-2' + (checked ? ' font-bold' : '')}>On</p>
            </div>       
        </label>
    )
}