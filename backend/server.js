// Setup server, session and middleware here.
// Used docker for redis server 
import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
//import redis from 'redis';
import cors from 'cors';
//const client = redis.createClient();
//client.connect().then(() => {});


app.use(express.json());

app.use(
  session({
    name: 'AuthenticationState',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
  })
);


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};



app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.use(cors());

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});

