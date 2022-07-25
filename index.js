const express = require("express")
const route = require("./routes/route")
const app = express()
const mongoose = require("mongoose")

app.use(express.json())


mongoose.connect("mongodb+srv://Pragesh_Yadav:Mongoblog22@cluster0.ebq4hak.mongodb.net/urlShortnerGroup41",
    {useNewUrlParser: true
    })
    .then(() => console.log("MongoDB is connected"))
    .catch((err) => console.log(err));

app.use('/', route)


app.listen(process.env.PORT || 3000, function(){
    console.log("Express app running on port",(process.env.PORT || 3000) )
})

