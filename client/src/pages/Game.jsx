import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

function Game(){

    const params = useParams();
    
    const room_id = params.room_id;

    const socket = useRef();

    const draw1 = useRef();

    const draw2 = useRef();

    const me = useRef(uuidv4());

    const [started, setStarted] = useState(false)

    function animate(){
        window.requestAnimationFrame(animate);

    }

    useEffect(()=>{

        const user = draw1.current
        const opp = draw2.current
        const c = user.getContext('2d')
        const d = opp.getContext('2d')

        user.width = 500;
        user.height = 500;

        opp.width = 500;
        opp.height = 500;

        c.beginPath();
        c.fillStyle = "white";
        c.fillRect(0,0,user.width, user.height)

        d.beginPath();
        d.fillStyle = "white";
        d.fillRect(0,0,user.width, user.height)

        socket.current = new WebSocket("ws://localhost:8080");

        socket.current.onopen = () => {
            console.log("Open");
            socket.current.send(JSON.stringify({type: "join", id: me.current, room: room_id}))
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data)

            console.log(data);

            if (data.type == "started"){
                setStarted(true)
            }
        };

        socket.current.onclose = () => {
            console.log("Closed")
        };

        return () => {
            socket.current?.close();
        };
    },[])

    return(
        <div className="w-full flex gap-100 items-center">
            <canvas className= {`rounded-xl border-4 border-slate-500 ${!started ? "hidden" : ""}`} ref={draw1}></canvas>
            <canvas className= {`rounded-xl border-4 border-slate-500 ${!started ? "hidden" : ""}`} ref={draw2}></canvas>

            {
                (!started) && (
                    <h1>Waiting for opponent to join...</h1>
                )
            }

        </div>

    )

}

export default Game;