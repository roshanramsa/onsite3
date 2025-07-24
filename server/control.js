import jwt from 'jsonwebtoken';
import service from './service.js'



async function login(req, res){
    const username = req.body.username;
    const check = await service.findOrAddUser(username);
    
    console.log(check)

    if (check.code != 0){
        req.session.user_id = check.user_id;
        res.json({code: check.code, status: check.status})
    }
    else{
        res.json({code: 0, status: "err"})
    }
}

export default {
    login
}