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

// Return all users from the database
app.get('/login', async (req, res) =>{

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

// /login/:id
app.get('/login/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('stravaroutesapp').collection('login');

        //only look for a challenge with this ID
        const query = { _id: ObjectId(req.params.id) };

        const challenge = await colli.findOne(query);

        if(challenge){
            //Send back the file
            res.status(200).send(challenge);
            return;
        }else{
            res.status(400).send('User could not be found with id: ' + req.params.id);
        }
      
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// save a user
app.post('/login', async (req, res) => {

    if(!req.body.first_name || !req.body.last_name || !req.body.password){
        res.status(400).send('Bad request: missing first name, last name or password');
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the challenge collection data
        const colli = client.db('stravaroutesapp').collection('login');

        // Validation for double challenges
        const challenge = await colli.findOne({first_name: req.body.first_name, last_name: req.body.last_name, password: req.body.password});
        if(challenge){
            res.status(400).send('Bad request: user already exists with ' + 'first name ' + req.body.first_name + 'last name ' + req.body.last_name);
            return;
        } 
        // Create the new user
        let newUser = {
            name: req.body.first_name,
            points: req.body.last_name,
            course: req.body.password
        }
        
        // Insert into the database
        let insertResult = await colli.insertOne(newUser);

        //Send back successmessage
        res.status(201).json(newUser);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    }finally {
        await client.close();
    }
});

// delete user
app.delete('/login/:id', async (req,res) => {
    //id is located in the query: req.params.id
    try{
        //connect to the db
        await client.connect();

        //retrieve the user collection data
        const colli = client.db('stravaroutesapp').collection('login');

        //only look for a user with this ID
        const query = { _id: ObjectId(req.params.id) };

        const user = await colli.deleteOne({ _id: ObjectId(req.params.id) });

        if(user){
            //Send back the file
            res.status(200).send(user);
            return;
        }else{
            res.status(400).send('err');
        }
      
    }catch(error){
        console.log(error);
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