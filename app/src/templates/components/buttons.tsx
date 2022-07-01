
export function Btn(props:{
    text: string,
    onClick: Function,
    important?: boolean
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
