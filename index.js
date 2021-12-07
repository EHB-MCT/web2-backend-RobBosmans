const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

//Create the mongo client to use
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT // 1337;

app.use(express.static('public'));
app.use(bodyParser.json());


//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

// Return all challenges from the database
app.get('/challenges', async (req, res) =>{

    try{
        //connect to the db
        await client.connect();

        //retrieve the challenges collection data
        const colli = client.db('stravaroutesapp').collection('login');
        const chs = await colli.find({}).toArray();

        //Send back the data with the response
        res.status(200).send(chs);
    }catch(error){
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});


app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
})