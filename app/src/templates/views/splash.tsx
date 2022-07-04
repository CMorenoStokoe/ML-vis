import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faChartBar, faChartColumn, faChartLine, faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';

export function Splash(props:{
    loaded: boolean;
    onContinue: ()=>void; 
}):JSX.Element{
    return(
        <div className='h-full flex flex-col justify-around items-center bg-white'>
            <div className='w-3/4 p-6 flex flex-col justify-center items-center text-center rounded-xl bg-primary-hue shadow'>
                <p className='w-3/4 pb-6 font-display font-bold text-8xl text-primary-shade'>
                    <FontAwesomeIcon icon={faMagnifyingGlassChart} className='pl-1'/>ML-vis
                </p>
                <p className='w-3/4 font-main text-2xl '>A visualisation tech demo for visualising 2D machine learning outputs using a modern tech stack including D3, React and Typescript.</p>
                <div className='relative'>
                    <button className={'mt-12 p-3 px-4 font-display font-bold text-3xl text-white rounded-xl shadow bg-accent-hue transition-all transition-all  delay-1000  hover:animate-bounce '
                        + (props.loaded ? 'opacity-100' : 'opacity-0')} 
                        onClick={props.onContinue}>
                        Start <FontAwesomeIcon icon={faArrowPointer} />
                    </button>
                    <p className={'p-2 w-full flex flex-col justify-center items-center absolute top-1/4 left-0 rounded-full transition-all delay-1000 pointer-events-none ' + (props.loaded ? 'opacity-0' : 'opacity-100')}>
                        <FontAwesomeIcon icon={faChartColumn} className='p-2 animate-spin text-4xl font-bold'/>
                        <p>Loading... </p>
                    </p>               
                </div>
            </div>
            <div></div>
        </div>
    )
}