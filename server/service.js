
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import pg from "pg"

const db = new pg.Pool({
    user: "postgres",
    host: "localhost",
    database: "onsite",
    password: "123456",
    port: 5432,
});

db.connect();

async function findOrAddUser(username){
    try{
        const exists = await db.query(
            "SELECT * FROM users WHERE username=$1", [username]
        );

        if (exists.rows.length > 0){
            return({code: 1, status: "exists", user_id: exists.rows[0].id})
        }
        else{
            const add = await db.query(
                "INSERT INTO users (username) VALUES ($1) RETURNING id", [username]
            )

            return ({code: 2, status: "created", user_id: add.rows[0].id, username: username})
        }
        
    }catch(err){
        return({status: err.message, code: 0})
    }
}


export default {
    findOrAddUser
}
