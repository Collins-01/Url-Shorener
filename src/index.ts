import express, {Application, Request, Response} from 'express';
import http from 'http';
import bodyParser from 'body-parser'
import shortid from 'shortid';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
 dotenv.config();

const firebaseCredentials = {
  "type": process.env.FIREBASE_TYPE,
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": process.env.FIREBASE_AUTH_URI,
  "token_uri": process.env.FIREBASE_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
  "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN,
}

admin.initializeApp(
  {
    credential: admin.credential.cert(firebaseCredentials as admin.ServiceAccount)
  }
)
const db = admin.firestore();
// dotenv.config()
const URL_NAMESPACE = 'urls';
const app:Application = express()
const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// app.use((req, res, next) => {
//     res.status(404).json({
//         message: `Not Found`
//     })
//   });
  
app.get('/ping', (req, res) => {
    res.status(200).json({
        message: 'Pong',
        ip: req.ip
    });
});



app.post('/shorten', async (req:Request, res:Response) => {
   try {
    const { longUrl } = req.body;
  
    // Generate a short URL
    const shortUrl = shortid.generate();
    console.log(shortUrl);
    // Save to the database
 
    // await url.save();
  const entry=  db.collection(URL_NAMESPACE).doc();
  const data = {
    'short_url': shortUrl,
    'long_url': longUrl,
    'clicks': 0,
  };
  await entry.set(data);
  
    res.status(201).json({ shortUrl });
   } catch (error) {
        console.log(`Failed to generate url::: ${error}`);
        return res.status(500).json({
            message: `Failed to generate url`,
            error: error,
        })
   }
  });

app.get('/:shortUrl', async (req:Request, res:Response) => {
  try {
    const { shortUrl } = req.params;
    // console.log(shortUrl);
      // Find the long URL in the database
      const querySnapshot = await db.collection(URL_NAMESPACE)
      .where('short_url', '==', shortUrl) // replace 'attribute' and 'value' with your desired attribute and value
      .get();
      if (!querySnapshot.empty) {
        const data =querySnapshot.docs[0].data()['long_url'];
        res.redirect(data)
      } else {
        return res.status(404).json({
          message: `url not found`
        })
      }
  } catch (error) {
    return res.status(500).json({
      message : error,
    }) 
  }
  });


const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;


server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});