import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {Btn} from '../components/controls';
import { faArrowPointer, faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';

export function Splash(props:{
    onContinue: ()=>void; 
}):JSX.Element{
    return(
        <div className='flex flex-col justify-around items-center bg-primary-hue'>
            <div className='w-3/4 p-6 flex flex-col justify-center items-center text-center rounded-xl text-white bg-primary-shade shadow'>
                <p className='w-3/4 pb-6 font-display font-bold text-8xl text-white animate-pulse'>
                    <FontAwesomeIcon icon={faMagnifyingGlassChart}/>ML-vis
                </p>
                <p className='w-3/4 font-main text-2xl '>A visualisation tech demo for visualising 2D machine learning outputs using a modern tech stack including D3, React and Typescript.</p>
                <button className='mt-12 p-3 px-4 font-display font-bold text-3xl rounded-xl shadow bg-accent-hue hover:bg-primary-hue hover:text-black hover:animate-bounce' 
                    onClick={props.onContinue}>
                    Start <FontAwesomeIcon icon={faArrowPointer} />
                </button>
            </div>
            <div></div>
        </div>
    )
}