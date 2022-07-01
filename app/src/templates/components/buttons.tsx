import React, {createRef, useState} from 'react';

export function Btn(props:{
    text: string;
    onClick: Function;
    important?: boolean;
}):JSX.Element{
    const bg = props.important ? 'bg-contrast' : 'bg-primary-dark';
    return(
        <button 
            className={`m-2 p-2 rounded-xl text-white ${bg}`}
            onClick={()=>{props.onClick()}}
        >
            {props.text}
        </button>
    )
}

export function Dropdown(props:{
    options: {key: string; label: string; value: string}[];
    current: string;
    onChange: Function;
}):JSX.Element{
    return(
        <div>
            <label>Filter by date
                <select value={props.current} onChange={(e)=>{props.onChange(e.target.value)}} >
                    <option value={''} key='opt_default'>none</option>
                    {props.options.map(o =>
                        <option value={o.value} key={o.key}>{o.label}</option> 
                    )}
                </select>
            </label>
        </div>
    )
}

export function DateForm(props:{
    activeDateFilter: { 
        start: string;
        end: string;
    }; 
    dateRange:{
        earliest:string;
        latest: string;
    }
    onChange: Function;
}):JSX.Element{
    const [start, setStart] = useState<string>(props.activeDateFilter.start);
    const [end, setEnd] = useState<string>(props.activeDateFilter.end);

    // Change handlers to set and clear filters
    const changeHandler = () => {
        if(start! < end!){
            props.onChange({start: start, end: end})
        } else {
            alert('Please select valid dates (start date was after end)')
        }
    }
    const clearFilters = () => {
        props.onChange({start: '', end: ''})
    }

    return(
        <div>
            <p>Filter by date range</p>
            <label>Start date:
                <input type='date' ref={createRef()} name='start' value={props.dateRange.earliest}
                    min={props.dateRange.earliest} max={props.dateRange.latest} 
                    onChange = {(e)=>{setStart(e.target.value)}} 
                />
            </label>
            <label>End date:
                <input type='date' ref={createRef()} name='end' value={props.dateRange.latest}
                    min={props.dateRange.earliest} max={props.dateRange.latest}  
                    onChange = {(e)=>{setEnd(e.target.value)}} 
                />
            </label>
            <Btn text='Filter' onClick={changeHandler}/>
            <Btn text='Clear' onClick={clearFilters}/>
        </div>
    )
}