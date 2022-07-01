import {Btn} from '../components/buttons';

export function Splash(props:{
    onClick: {
        continue: Function
    }
}):JSX.Element{
    return(
        <div>
            <Btn text='Enter >' onClick={ ()=>{props.onClick.continue()} }/>
        </div>
    )
}
