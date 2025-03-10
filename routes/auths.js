const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

router.post("/register",async(req,res)=>{
    const {username,password, role} = req.body;

    if(!username || !password) return res.status(400).json({message:"Username or password is required"});

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role || "user"],
            (err, result) => {
                if (err) return res.status(500).json({ message: "User already exists" });
                res.status(201).json({ message: "User registered successfully" });
            }
        );

    }catch(err){
        res.status(500).json({message:"server error"});
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ message: "All fields required" });

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    });
});

module.exports = router;