import { useEffect } from "react";
import { useState } from "react";
import {useNavigate} from 'react-router-dom'

function Login(){

    const [room, setroom] = useState();

    const navigate = useNavigate();

    const handleSubmit = ()=>{
            navigate(`/game/${room}`)
        }

    return (

        <div className="flex flex-col item bg-gray-300 rounded-2xl gap-10 text-gray-900 p-5">
            <h1>Enter room name</h1>
            <input className="bg-gray-700/10 rounded-xl p-1" onChange={(event) => {setroom(event.target.value)}} type="text" />

            <button className="cursor-pointer" onClick={handleSubmit}>Submit</button>

        </div>

        

    )
}

export default Login;