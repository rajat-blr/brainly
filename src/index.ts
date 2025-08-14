import express from "express";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";



const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        await UserModel.create({
            username: username,
            password: password
        })
    } catch (e) {
        res.status(411).json({
            message: "User already exists"
        })
    }

    res.json({
        message: "User signed up"
    })

})

app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)
        res.json({
            token
        })

    }
    else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }



})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })

    return res.json({
        message: "Content added"
    })

})

app.get("/api/v1/content",userMiddleware, async (req, res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId : userId
    }).populate("userId", "username")
    res.json({
        content
    })
})

app.delete("/api/v1/content",userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId

    })
    res.json({
        message: "Deleted"
    })
})

app.post("/api/v1/brain/share", userMiddleware, async(req, res) => {
    const share = req.body.share;
    if(share){
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash : random(10)

        })
    } else {
       await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId
        })
    }
    res.json({
        message: "Updated shareable Link"
    })
})

app.get("/api/v1/brain/:shareLink", (req, res) => {

})

app.listen(3000);