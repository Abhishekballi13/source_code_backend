// // const http = require("http");
// // const gfname = require("./features")
// import http from "http"
// // import gfname from "./features.js"
// // import {gfname1,gfname2} from "./features.js"
// // console.log(gfname1);
// import { generateLovePercent } from "./features.js";
// import fs from "fs"
// import path from "path"
// // const home  = fs.readFile("./index.html",()=>{
// //     console.log("File read");
// // })
// // console.log(home)
// // console.log(generateLovePercent());

// const home = fs.readFileSync("./index.html")

// console.log(path.dirname("/home/random/index.js"))

// const server = http.createServer((req,res)=>{
//     if(req.url=="/about"){
//         res.end(`<h1>Love is ${generateLovePercent()}</h1>`);
//     }
//     if(req.url=="/"){
//             res.end(home);
//     }
//     if(req.url=="/contact"){
//         res.end("<h1>Contact page</h1>");
//     }
//     else{
//         res.end("<h1>page not found</h1>");
//     }
// })

// server.listen(5000, () => {
//   console.log("server is working")
// });


import express from 'express'
import fs from "fs"
import path from "path"
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
})
.then(()=>console.log("Database connected"))
.catch((e)=>console.log(e));
//schema bna diya
// const messageSchema = new mongoose.Schema({
//     name:String,
//     email:String,
// })

//login vale ke liye ek schema bnate hue
const userSchema = new mongoose.Schema({
 name:String,
 email:String,
 password:String,
})

//ye bna diya message
// const Message = mongoose.model("Message",messageSchema);
const User = mongoose.model("User",userSchema);

//creating server
const app = express();

//ye ek middleware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

//setting up view engine
app.set("view engine","ejs")

const isAuthenticated = async (req,res,next)=>{
   const { token } = req.cookies;
   if(token){
    const decoded = jwt.verify(token,"abcdexghfj");
    //agar token hai to save hojaegi user ki information
    req.user = await User.findById(decoded._id);
    next();
   }
   else{
    res.redirect("/login");
   }
}

// isAuthenticated ek handler hai jab call hojayega tab next ko call krke age vale handler par chla jayega
app.get("/",isAuthenticated,(req,res)=>{
//  console.log(req.user);
 res.render("logout",{name:req.user.name});
})

app.get("/register",(req,res)=>{
    res.render("register");
   })
   
app.get("/login",(req,res)=>{
    res.render("login");
   })

app.get("/logout",(req,res)=>{
    res.cookie("token","null",{
        //abhi ke abhi expire hojayega
        expires:new Date(Date.now())
    });
    res.redirect("/");
})

// app.get("/",(req,res)=>{
//     //distructure krliya
//     const {token} = req.cookies;
//     if(token){
//         res.render("logout")
//     }
//     else{
//         res.render("login")
//     }
    
//     // res.sendFile("index")
// })


app.post("/register",async (req,res)=>{
    // console.log(req.body);
    const {name,email,password}=req.body;

    let user = await User.findOne({email})

    if(user){
       return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password,10);
     user  = await User.create({
        name:name,
        email:email,
        password:hashedPassword,
    })

    const token = jwt.sign({_id:user._id},"abcdexghfj");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });
    res.redirect("/");  
})

app.post("/login",async (req,res)=>{
    const {email,password}=req.body;
    let user =await User.findOne({email});

    if(!user){
        return res.redirect("/register");
    }
    // const isMatch = user.password===password;
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.render("login",{email,message:"Incorrect Password"});
    }

    const token = jwt.sign({_id:user._id},"abcdexghfj");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000)
    });

    res.redirect("/");  
})

// app.get("/add",async(req,res)=>{
//     //await lag gya ye is point pr freeze ho jayega,jab ye reject ho ya fulfill ho tbhi chlega
//     await Message.create({name:"Abhi",email:"abhi@gmail.com"}).then(()=>{
//         res.send("Nice");
//     });
// })

// app.get("/success",(req,res)=>{
//     res.render("success");
// })


// app.post("/contact",async (req,res)=>{
//     // console.log(req.body)
//     // const messageData = { username: req.body.name, email:req.body.email};
//     // console.log(messageData);
    
//     //ek tareeka ye hai
//     // await Message.create({name:req.body.name,email:req.body.email});

//     //dusra ye ki distructuring krlo
//     const {name,email} = req.body;
//     // await Message.create({name:name,email:email});
//     //agr key value pair same hai to more cleaner way
//     await Message.create({name,email});
//     res.redirect("/success");
// })



// app.get("/users",(req,res)=>{
//     res.json({
//         users,
//     })
// })


// app.get("/getproducts",(req,res)=>{
//     // res.status(400).send("meri marzi")
//     const pathlocation = path.resolve();
//     // res.sendFile(path.join(pathlocation,"./index.html"));
// })

// app.get("/",(req,res)=>{
//     //    res.send("hi")
//         // res.sendStatus(404);
//         res.json({
//             success:true,
//             products:[]
//         })
//     })

app.listen(5000,()=>{
    console.log("Server is working");
});



