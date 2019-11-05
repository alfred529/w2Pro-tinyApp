// Import dependencies and set port

var express = require("express");
var app = express();
var cookieSession = require("cookie-session");
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

const bcrypt = require('bcryptjs');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 10);

//------------------------------------------------------------//
// Middleware

app.use(bodyParser.urlencoded({extended: true}));   // false => object returning will have only strings or arrays in the key-value pair
                                                    // true => can have other values e.g. dates, undefined, null
app.use(cookieSession({
  name: 'session',
  keys: ["Don't touch my cookies!"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

//------------------------------------------------------------//
// Use Public folder

app.use(express.static(__dirname + '/public'));

//------------------------------------------------------------//
// Variable Declarations and Functions

var urlDatabase = {
  "b2xVn2": {
    website: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    website: "http://www.google.com",
    userID: "user2RandomID",
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("asdf")
  },
  "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: bcrypt.hashSync("dishwasher-funk")
  }
};



function generateRandomString() {
  var randomURL = "";
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomURL += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  }
  return randomURL;
}

function checkCredentials(userEmail, userPassword) {
  for (existUsers in users) {
    if (userEmail === users[existUsers].email) {
      if (bcrypt.compareSync(userPassword, users[existUsers].password)) {
        return true;
      }
    }
  }
  return false;
}


// takes in id, returns the url's stored for that id
function urlsForUser(id) {
  const userDatabase = {};
  for (eachFile in urlDatabase) {
    if (urlDatabase[eachFile]['userID'] === id) {
      userDatabase[eachFile] = {
        website: urlDatabase[eachFile]['website'],
        userID: urlDatabase[eachFile]['userID']
      };
    };
  }
  return userDatabase;
}

//------------------------------------------------------------//
//App.get

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    var userSpecificDatabase = urlsForUser(users[req.session.user_id].id);
  } else {
    var userSpecificDatabase = "I AM AN EMTPY DATABASE!"
  }
  let templateVars = { urls: userSpecificDatabase, user_id: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    var userSpecificDatabase = urlsForUser(users[req.session.user_id].id);
  } else {
    var userSpecificDatabase = "I AM AN EMPTY DATABASE!"
  }
  let templateVars = { urls: userSpecificDatabase, user_id: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].website;
  res.redirect(longURL);
});

// the connection between the .ejs pages and this server page
// the shortURL is mapped to req.params.id, longURL is mapped to urlDatabase[req.params.id]
app.get("/urls/:id", (req, res) => {
  let templateVars = { user_id: users[req.session.user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id]["website"] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
})

// app.get("/login", (req, res) => {
app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.session.user_id] };
  res.render("login", templateVars);
})


//------------------------------------------------------------//
//App.post


// takes the registration information and stores it in the object USERS
app.post("/register", (req, res) => {
  // if empty argument
  randomUserID = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Either email or password is not correct")
    console.log("You should see this!")
    return;
  }
  // if email already exists
  for (existUsers in users) {
    if (req.body.email === users[existUsers].email) {
      res.status(400).send("Email address already registered")
      console.log("You should see this!")
      return;
    }
  }
  console.log("You should not see this!")
  // store new user in USERS object
  users[randomUserID] = {
  id: randomUserID,
  email: req.body.email,
  password: bcrypt.hashSync(req.body.password, 10)
  }
  //sets userID cookie
  req.session.user_id = randomUserID;

  res.redirect(`/urls`)
});

// takes the login information to check if it is correct, and logs in and stores cookie
app.post("/login", (req, res) => {
  // check email and password -> if found will redirect and return
  if (checkCredentials(req.body.email, req.body.password) === true) {
    //sets userID cookie
    req.session.user_id = users[existUsers].id;
    res.redirect(`/urls`)
  } else {
    res.status(403).send("Email or password invalid")
  }
});

//Cookie delete
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/`);
});



//this takes the new URL from url/new, and adds it the the urlDatabase
app.post("/urls", (req, res) => {
  const newURL = generateRandomString();
  urlDatabase[newURL] = {
    website: req.body.longURL,
    userID: users[req.session.user_id].id,
  }
  res.redirect(`/urls`);
});

// this takes the 'action' key /urls/:id/delete that was 'posted' by client
// and performs the function
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//this takes the 'action' key /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    website: req.body.longURL,
    userID: users[req.session.user_id].id
  }
  res.redirect(`/urls`);
});




//------------------------------------------------------------//
//Port


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

