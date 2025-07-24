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

        const mouse = useRef()

        const me = useRef(uuidv4());

        const opponent = useRef();

        const [started, setStarted] = useState(false)

        const grid_size = 4;

        const width = 500;
        const height = 500

        const grid = {width: Math.floor(width/grid_size), height: Math.floor(height/grid_size) }
        

        const [positions, setPositions] = useState(new Array(grid_size * grid_size).fill(0));
        const [opositions, setOPositions] = useState(new Array(grid_size * grid_size).fill(0));

        const [my_score, setScore] = useState(6);

        const turn = useRef();

        const [over, setOver] = useState(false)

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
            c.fillStyle = "black";
            c.fillRect(0,0,user.width, user.height)

            d.beginPath();
            d.fillStyle = "black";
            d.fillRect(0,0,user.width, user.height)


            for (var i = 0; i < grid_size ; i += 1){
                c.beginPath()
                c.strokeStyle = "white"
                c.moveTo(i * grid.width, 0);
                c.lineTo(i * grid.width, user.height)
                c.stroke();

                c.beginPath()
                c.strokeStyle = "white"
                c.moveTo(0, i * grid.width);
                c.lineTo(user.width, i * grid.width)
                c.stroke();
            }
            for (var i = 0; i < grid_size ; i += 1){
                d.beginPath()
                d.strokeStyle = "white"
                d.moveTo(i * grid.width, 0);
                d.lineTo(i * grid.width, user.height)
                d.stroke();

                d.beginPath()
                d.strokeStyle = "white"
                d.moveTo(0, i * grid.width);
                d.lineTo(user.width, i * grid.width)
                d.stroke();
            }


            function generateShips() {
                const new_pos = new Array(grid_size * grid_size).fill(0);

                for (const ship of ships) {
                    let placed = false;

                    while (!placed) {
                        const axis = Math.random() < 0.5;
                        const x = Math.floor(Math.random() * (axis ? grid_size - ship + 1 : grid_size));
                        const y = Math.floor(Math.random() * (axis ? grid_size : grid_size - ship + 1));

                        var yep = true;

                        for (let i = 0; i < ship; i++) {
                            const xi = axis ? x + i : x;
                            const yi = axis ? y : y + i;
                            const index = yi * grid_size + xi;

                            if (new_pos[index] !== 0) {
                                yep = false;
                                break;
                            }
                        }

                        if (yep) {
                            for (let i = 0; i < ship; i++) {
                                const xi = axis ? x + i : x;
                                const yi = axis ? y : y + i;
                                const index = yi * grid_size + xi;

                                new_pos[index] = 1; 
                            }

                            placed = true;
                        }
                    }
                }

                setPositions(new_pos);

                return (new_pos)
            }

            const ships = [2,3,1];

            const pos = generateShips()

            console.log("ello")
            console.log(pos)

            for (var i = 0; i< grid_size; i++){
                for (var j = 0; j<grid_size; j++){
                    if (pos[i + grid_size * j] == 1){
                        c.beginPath();
                        c.fillStyle = "green"
                        c.fillRect(i * grid.width, j * grid.height, grid.width, grid.height)
                    }
                }
            }
            
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
                    opponent.current = data.users.filter(id => id != me.current)[0]
                    console.log(me.current)
                    console.log(opponent.current)

                    turn.current = data.started;

                    console.log("hekki")
                    console.log(turn.current)

                    socket.current.send(JSON.stringify({positions: pos, id: me.current, type: "pos"}))
                }

                if (data.type == "update"){
                    setPositions(data.positions)
                    turn.current = data.turn;
                }
                if (data.type == "pos"){
                    setOPositions(data.positions)
                }
                if (data.type == "over"){
                    setOver(true)
                }
            };

            socket.current.onclose = () => {
                console.log("Closed")
            };

            return () => {
                socket.current?.close();
            };

        },[])

        useEffect(()=>{

            console.log(opositions)

            const user = draw1.current
            const opp = draw2.current

            const c = user.getContext('2d')
            const d = opp.getContext('2d')

            for (var i = 0; i < grid_size ; i += 1){
                for (var j = 0; j < grid_size ; j += 1){
                    if (opositions[i + j * grid_size] == 3){
                        d.beginPath();
                        d.fillStyle = "rgba(200,10,10,100%)";
                        d.arc(i * grid.width + grid.width/2, j* grid.height + grid.height/2, grid.height/2, 0, 2*Math.PI, false)
                        d.fill()
                    }
                    if (opositions[i + j * grid_size] == 2){
                        d.beginPath();
                        d.fillStyle = "rgba(100,100,100,100%)";
                        d.fillRect(i * grid.width, j* grid.height, grid.width, grid.height)
                    }
                }
            }

        }, [opositions])

        useEffect(()=>{

            const user = draw1.current
            const opp = draw2.current

            const c = user.getContext('2d')
            const d = opp.getContext('2d')

            for (var i = 0; i < grid_size ; i += 1){
                for (var j = 0; j < grid_size ; j += 1){
                    if (positions[i + j * grid_size] == 3){
                        c.beginPath();
                        c.fillStyle = "rgba(200,10,10,100%)";
                        c.arc(i * grid.width + grid.width/2, j* grid.height + grid.height/2, grid.height/2, 0, 2*Math.PI, false)
                        c.fill()
                    }
                    if (positions[i + j * grid_size] == 2){
                        c.beginPath();
                        c.fillStyle = "rgba(100,100,100,100%)";
                        c.fillRect(i * grid.width, j* grid.height, grid.width, grid.height)
                    }
                }
            }

        }, [positions])

        useEffect(() => {
            console.log(my_score)
            if (my_score <= 0){
                if (socket.current.readyState == WebSocket.OPEN){
                    socket.current.send(JSON.stringify({type: "over", winner: me}))
                }
            }
        }, [my_score])

        const validMove = (pos) => {
            if (socket.current.readyState == WebSocket.OPEN){
                socket.current.send(JSON.stringify({positions: pos, id: me.current, type: "update", turn: (turn.current) ? me.current : opponent.current}))
            }
        }

        return(
            <div className="w-full flex gap-10 justify-around items-center">
                <canvas 
                className= {`rounded-xl border-4 border-slate-100 ${!started ? "hidden" : ""}`} ref={draw1}></canvas>
                <canvas onMouseDown={(e) => {

                    if (turn.current !== me.current) return;

                    const x = (e.clientX - draw2.current.getBoundingClientRect().x);
                    const y = (e.clientY - draw2.current.getBoundingClientRect().y);
                    const tile_x = Math.floor(x/grid.width);
                    const tile_y = Math.floor(y/grid.height);

                    console.log(`${tile_x}-${tile_y}`);
                    
                    const pos = [...opositions];

                    if (pos[tile_x + grid_size * tile_y] == 1){
                        setScore(prev => prev-1);
                        pos[tile_x + grid_size * tile_y] = 3;
                        setOPositions(prev => {
                            const newpos = [...prev];
                            newpos[tile_x + grid_size * tile_y] = 3;
                            return newpos;
                        });
                    validMove(pos);
                    }

                    else if (pos[tile_x + grid_size * tile_y] != 2){
                        setScore(prev => prev--)
                        pos[tile_x + grid_size * tile_y] = 2
                        setOPositions(prev => {
                            const newpos = [...prev];
                            newpos[tile_x + grid_size * tile_y] = 2;
                            return newpos;
                        });

                        turn.current = false
                    validMove(pos);
                    }
                    

                    
                        
                }} 
                
                className= {`rounded-xl border-4 border-slate-100 ${!started ? "hidden" : ""}`} ref={draw2}></canvas>

                {
                    (!started) && (
                        <h1>Waiting for opponent to join...</h1>
                    )
                }

                {
                    (over) && (
                        <div className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-10 flex justify-center  items-center">
                            <h1>Game Over</h1>
                        </div>
                    )
                }

            </div>

        )

    }

    export default Game;