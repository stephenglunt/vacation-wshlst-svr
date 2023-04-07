const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use(express.json());

MongoClient.connect("mongodb+srv://saglunt:1Eqd7l70UCHqfW5C@places.tdrbb4s.mongodb.net/?retryWrites=true&w=majority", {
    useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        const db = client.db('vacation-destinations');
        const cards = db.collection('places');

        app.listen(3000, () => {
            console.log('listening on 3000, vacation app');
        })

        app.delete('/cards', (req, res) => {
            console.log("ID of CARD to delete: " + req.body.id);
            cards.deleteOne(
                { _id: new ObjectId(req.body.id) }
            )
            .then(result => {
                if(result.deletedCount === 0) {
                    return res.json('ERROR - no such card');
                }
                res.json('Deleted card: ' + req.body.id);
            })
        })

        app.put('/cards', (req, res) => {
            console.log("FIND STRING", req.body.id);
            cards.findOneAndUpdate(
                { _id: new ObjectId(req.body.id) },
                {
                    $set: {
                        name: req.body.name,
                        location: req.body.location,
                        photo: req.body.photo,
                        description: req.body.description
                    }
                }
            )
            .then(result => {
                console.log("RESULT on SERVER: ", result);
                res.json('Sucess');
            })
            .catch(err => console.error(err));
        })

        app.get('/cards', (req, res) => {
            const cursor = db.collection('places').find().toArray()
            .then(results => {
                res.status(200).json(results);
            })
            .catch(error => console.error(error))
        })

        app.get('/', (req, res) => {
            const cursor = db.collection('places').find().toArray()
            .then(results => {
                console.log(results)
            })
            .catch(error => console.error(error));
            res.sendFile(__dirname + "/index.html");
        })

        app.post('/place', (req, res) => {
            console.log("Data to server: ", req.body);
            cards.insertOne(req.body)
            .then(result => {
                res.status(200).json(result);
                console.log(result);
            })
            .catch(error => console.error(error))
            console.log(req.body);
        })
    })
    .catch(err => console.error(err));
