const express = require('express')
require('dotenv').config()
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



//midleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q2gnz40.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // await client.connect();
        // Send a ping to confirm a successful connection

        const db = client.db("CarRantal");
        const carCollection = db.collection("allcar");
        const userCollection = db.collection("user")
        const adminCollection = db.collection("admin")
        const bookingCollection = db.collection("booking")
        const reviewCollection = db.collection("review")
        const qualityCollection = db.collection("quality")
        const messageCollection = db.collection("message")

        app.get('/all-car', async (req, res) => {
            const findResult = (await carCollection.find().toArray());
            console.log(findResult)
            res.send(findResult)
        })
        app.post('/car', async (req, res) => {
            const carData = req.body
            // console.log(carData)
            const result = await carCollection.insertOne(carData)
            res.send('data post')
        })
        //review post

        app.post('/reviews', async (req, res) => {
            const reviewData = req.body
            const result = await reviewCollection.insertOne(reviewData)
            res.send(result)
        })

        app.get('/review', async (req, res) => {
            try {
                const result = await reviewCollection
                    .find({})
                    .sort({ date: -1 })
                    .limit(6)
                    .toArray();

                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching reviews" });
            }
        });

        app.get('/my-reviews', async (req, res) => {
            try {

                const result = await reviewCollection.find().toArray()
                res.status(200).send(result)

            } catch (err) {
                res.status(500).send(err)
            }

        })


        app.get('/my-reviews', async (req, res) => {
            try {
                const email = req.query.email
                const filter = { userEmail: email }
                const result = await reviewCollection.find(filter).toArray()
                res.status(200).send(result)

            } catch (err) {
                res.status(500).send(err)
            }

        })

        ///  poast quality
        app.post('/qualityData', async (req, res) => {
            try {
                const qualityData = req.body
                const result = await qualityCollection.insertOne(qualityData)
                res.status(200).send(result)
            } catch (error) {
                res.status(500).send(error.message)
            }
        })

        app.get('/quality', async (req, res) => {
            try {
                const result = await qualityCollection.find().toArray()
                res.status(200).send(result)
            } catch (err) {
                res.status(500).send(error.message)
            }
        })

        app.get('/all-cars/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const carResult = await carCollection.findOne(query)
            res.send(carResult)
        })

        //post user
        app.post('/user', async (req, res) => {
            const userData = req.body;
            // console.log(req.body)
            const result = await userCollection.insertOne(userData);
            res.send('Data received');
        })

        app.get('/users', async (req, res) => {
            try {
                const users = await userCollection.find().toArray()
                console.log(users);
                res.status(200).send(users)
            } catch (err) {
                res.status(500).json({
                    message: err
                })
            }
        })

        //update car info
        app.put("/update-car/:id", async (req, res) => {

            const id = req.params.id
            const updatedCar = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updatedCar
            }
            const result = await carCollection.updateOne(filter, updateDoc);
            res.send(result);


        })
        // delete car by admin
        app.delete("/delete-car/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const result = await carCollection.deleteOne(filter);
            res.send(result);

        });
        //booking info
        app.post('/booking', async (req, res) => {
            const bookingData = req.body
            const userEmail = bookingData.email;
            const activeBookingsCount = await bookingCollection.countDocuments({
                email: userEmail,
                paymentStatus: 'pending'
            });
            // if (activeBookingsCount >= 3) {
            //     return res.status(400).send({
            //         message: 'You can rent maximum 1 cars at a time'
            //     });
            // }

            const result = await bookingCollection.insertOne(bookingData);
            res.send(result)
        })
        //get all booking
        app.get('/booking', async (req, res) => {
            const findBook = await bookingCollection.find().toArray()
            res.send(findBook)
        })
        //delete booking
        app.delete('/delete-booking/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(filter)
            res.send(result)
        })
        //find my-booking
        app.get('/my-booking', async (req, res) => {
            const email = req.query.email
            // console.log(email)
            const filter = { email: email }
            const result = await bookingCollection.find(filter).toArray()
            // console.log(result)
            res.send(result)
        })
        //fin role
        app.get('/role', async (req, res) => {
            const email = req.query.email

            const user = await userCollection.findOne({ email })
            if (user) {
                return res.send({ role: "user" });
            }
            const admin = await adminCollection.findOne({ email })
            if (admin) {
                return res.send({ role: 'Admin' })
            }
            return res.send({ role: "unknown" });
        })
        //update payment status put(`/paymentStatus/:${id}`)

        app.patch('/paymentStatus/:id', async (req, res) => {
            try {
                const { id } = req.params
                const filter = { _id: new ObjectId(id) }
                const updateDoc = {
                    $set: {
                        paymentStatus: "paid"
                    }
                }
                const result = await bookingCollection.updateOne(filter, updateDoc)
                return res.send(result)
            } catch (err) {
                res.status(500).json({
                    data: "not update"
                })
            }


        })

        // delete booking for individual user

        app.delete('/mybooking-cancle/:id', async (req, res) => {
            try {

                const { id } = req.params;
                // const {email} = req.body;
                const filter = { _id: new ObjectId(id) }


                const result = await bookingCollection.deleteOne(filter)
                res.send(result)


            } catch (error) {
                res.status(500).json({
                    message: error.message,
                    data: "data not find"
                })
            }
        })

        // message send into contact

        app.post('/message', async (req, res) => {
            try {
                const message = req.body
                const result = await messageCollection.insertOne(message)
                
                res.status(200).send(result)


            } catch (err) {
                res.status(500)
            }
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


