const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

//Create the mongo client to use 
const client = new MongoClient(process.env.MONGO_URL);

const app = express();
const port = process.env.PORT // 1337;

app.use(express.static('public'));
app.use(bodyParser.json());

const cors = require ('cors');
app.use(cors())

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

        const user = await colli.findOne(query);

        if(user){
            //Send back the file
            res.status(200).send(user);
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

    if(!req.body.name || !req.body.password){
        res.status(400).send('Bad request: missing first name, last name or password');
        return;
    }

    try{
        //connect to the db
        await client.connect();

        //retrieve the user collection data
        const colli = client.db('stravaroutesapp').collection('login');

        // Validation for double users
        const user = await colli.findOne({name: req.body.name, password: req.body.password});
        if(user){
            res.status(400).send('Bad request: user already exists with ' + 'name ' + req.body.name);
            return;
        } 
        // Create the new user
        let newUser = {
            name: req.body.name,
            password: req.body.password
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

//update a user
app.put('/login/:id', async (req,res) => {
    //Check for body data
    /* if(!req.body.name){
        res.status(400).send({
            error: 'Bad Request',
            value: 'Missing name'
        });
        return;
    } */

    try{
         //connect to the db
        await client.connect();

         //retrieve the user collection data
        const colli = client.db('stravaroutesapp').collection('login');

         // Validation for existing user
        const bg = await colli.findOne({_id: ObjectId(req.params.id)});
        if(!bg){
            res.status(400).send({
                error: 'Bad Request',
                value: `There is no user with id: ${req.params.id}`
            });
            return;
        } 
         // Create the new user object
        let newUser = {
            name: req.body.name,
            course: req.body.password
        }
        // Add the optional session field
        if(req.body.routes){
            newUser.routes = req.body.routes;
        }
        
         // Insert into the database
        let updateResult = await colli.updateOne({_id: ObjectId(req.params.id)}, 
        {$set: newUser});

         //Send back successmessage
        res.status(201).json(updateResult);
        return;
    }catch(error){
        console.log(error);
        res.status(500).send({
            error: 'error',
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