import { useEffect } from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";

function Game(){

    const params = useParams();
    
    const room_id = params.room_id;

    const socket = useRef();

    const canvas1 = useRef();

    const canvas2 = useRef();

    function animate(){
        window.requestAnimationFrame(animate);
        
    }

    useEffect(()=>{
        socket.current = new WebSocket("ws://localhost:8080");

        socket.current.onopen = () => {
            console.log("Open");
            socket.current.send()
        };

        socket.current.onmessage = (event) => {
            console.log(JSON.parse(event.data));
        };

        socket.current.onclose = () => {
            console.log("Closed")
        };

        return () => {
            socket.current?.close();
        };
    },[])

    return(

        <div className="w-full">
            <canvas ref={canvas1}></canvas>
            <canvas ref={canvas2}></canvas>
        </div>

    )

}

export default Game;