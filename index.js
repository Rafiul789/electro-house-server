const express = require('express');
const cors = require( 'cors');
var jwt = require('jsonwebtoken');

require('dotenv').config();
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT||5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mu0s0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{

    await client.connect();
    const productsCollection=client.db('electro_house').collection('products');
    const orderCollection=client.db('electro_house').collection('orders');
    const userCollection=client.db('electro_house').collection('users')
    const reviewCollection = client.db('electro_house').collection('review');
   
    app.get('/product',async(req,res)=>{
const query={};
const cursor=productsCollection.find(query)
const product=await cursor.toArray()
res.send(product);

    })

    app.get('/product/:id', async(req, res) =>{
        const id = req.params.id;
        const query={_id: ObjectId(id)};
        const product = await productsCollection.findOne(query);
        res.send(product);
    });

    app.get('/order',async(req,res)=>{
      const orders=await orderCollection.find().toArray();
      res.send(orders)
    })

    app.post('/order',async(req,res) =>{

const order=req.body;
const query={order:order.name,customerName:order.customerName
}
const exists= await orderCollection.findOne(query);
if(exists){
  return res.send({success:false,order:exists})
}
const result= await orderCollection.insertOne(order);
res.send({success:true,result})

    })

    app.get('/user',async(req,res)=>{
      const users=await userCollection.find().toArray();
      res.send(users)
    })
    app.put('/user/admin/:email',async(req,res)=>{
      const email=req.params.email;
     
      const filter={email:email}
     
      const updateDoc = {
       $set:{role:'admin'},
     };
     const result = await userCollection.updateOne(filter, updateDoc);
     res.send(result)
     })

    app.put('/user/:email',async(req,res)=>{
     const email=req.params.email;
     const user=req.body;
     const filter={email:email};
     const options={upsert:true};
     const updateDoc = {
      $set:user,
    };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    const token=jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '172h' })
    res.send({result,accessToken:token})
    })

    app.post('/review', async(req, res) =>{
      const newReview = req.body;
      console.log(newReview)
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
  });
  app.get('/review',async(req,res)=>{
    const reviews=await reviewCollection.find().toArray();
    res.send(reviews)
  })


}finally{

}

}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello From Electro House Server!')
})

app.listen(port, () => {
  console.log(`Electro House App listening on port ${port}`)
})