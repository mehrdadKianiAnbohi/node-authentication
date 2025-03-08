const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next)=>{
    const token = req.headers.authorization;
    if(!token) return res.status(403).json({message: "Access denied token"});

    jwt.verify(token.split(" ")[1],process.env.JWT_SECRET, (err,user)=>{
        if(err) return res.status(403).json({message:"Invalid token"});

        req.user = user;
        next();
    })
}

const authorizeRole = role =>(req,res,next)=>{
    if (req.user.role !== role) return res.status(403).json({message: "Forbidden"});
    next();
}

module.exports = {authenticateToken, authorizeRole};