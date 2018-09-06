//Import dependencies and set port

var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

//------------------------------------------------------------//
//Middleware?

app.use(bodyParser.urlencoded({extended: true}));   // false => object returning will have only strings or arrays in the key-value pair
                                                    // true => can have other values e.g. dates, undefined, null
app.use(cookieParser());
app.set("view engine", "ejs");


//------------------------------------------------------------//
//Variable Declarations and Functions

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
    password: "asdf"
  },
  "user2RandomID": {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
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
    console.log(userEmail)
    console.log(users[existUsers].email)
    console.log(userPassword)
    console.log(users[existUsers].password)
    if (userEmail === users[existUsers].email) {
      if (userPassword === users[existUsers].password) {
        return true;
      }
    }
  }
  return false
}

function urlsForUser(id) {
  for (eachFile in urlDatabase) {
    if (eachFile.userID = id) {
      const userDatabase[eachFile] =
    }
  }
  return userDatabase
}

//------------------------------------------------------------//
//App.get

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.cookies['user_id']] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//the connection between the .ejs pages and this server page
//the shortURL is mapped to req.params.id, longURL is mapped to urlDatabase[req.params.id]
app.get("/urls/:id", (req, res) => {
  let templateVars = { user_id: users[req.cookies['user_id']], shortURL: req.params.id, longURL: urlDatabase[req.params.id]["website"] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: users[req.cookies['user_id']] };
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
  }
  // if email already exists
  for (existUsers in users) {
    if (req.body.email === users[existUsers].email) {
      res.status(400).send("Email address already registered")
    }
  }
  // store new user in USERS object
  users[randomUserID] = {
  id: randomUserID,
  email: req.body.email,
  password: req.body.password
  }
  console.log(users)
  //sets userID cookie
  res.cookie("user_id", randomUserID);
  //debugging and redirecting
  console.log(users[randomUserID]);   // debug statement to see if input correctly
  res.redirect(`/urls`)
});

// takes the login information to check if it is correct, and logs in and stores cookie
app.post("/login", (req, res) => {
  // check email and password -> if found will redirect and return
  console.log(checkCredentials(req.body.email, req.body.password))
  if (checkCredentials(req.body.email, req.body.password) === true) {
    //sets userID cookie
    res.cookie("user_id", users[existUsers].id);
    res.redirect(`/urls`)
  } else {
    res.status(403).send("Email or password invalid")
  }
});

//Cookie delete
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect(`/urls`);
});



//this takes the new URL from url/new, and adds it the the urlDatabase
app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const newURL = generateRandomString();
  //console.log(newURL)
  console.log(req.body.longURL);
  console.log(users[req.cookies['user_id']].id);
  urlDatabase[newURL] = {
    website: req.body.longURL,
    userID: users[req.cookies['user_id']].id,
  }
  console.log(urlDatabase)
  res.redirect(`/urls`);
});

// this takes the 'action' key /urls/:id/delete that was 'posted' by client
// and performs the function
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//this takes the 'action' key /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  urlDatabase[req.params.id] = {
    website: req.body.longURL,
    userID: users[req.cookies['user_id']].id
  }
  res.redirect(`/urls`);
});




//------------------------------------------------------------//
//Port


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//console.log(generateRandomString())


