var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));   // false => object returning will have only strings or arrays in the key-value pair
                                                    // true => can have other values e.g. dates, undefined, null
app.use(cookieParser());
app.set("view engine", "ejs");

//------------------------------------------------------------//





//------------------------------------------------------------//

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var randomURL = "";
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomURL += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  }
  return randomURL;
}

//------------------------------------------------------------//

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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//the connection between the .ejs pages and this server page
//the shortURL is mapped to req.params.id, longURL is mapped to urlDatabase[req.params.id]
app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//------------------------------------------------------------//

//Cookie store
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

//Cookie delete
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect(`/urls`);
});

//this takes the new URL from url/new, and adds it the the urlDatabase
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const newURL = generateRandomString();
  //console.log(newURL)
  urlDatabase[newURL] = req.body.longURL;
  //console.log(urlDatabase)
  res.redirect(`/urls`);
});

//this takes the 'action' key /urls/:id/delete that was 'posted' by client
// and performs the function
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

//this takes the 'action' key /urls/:id/update
app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/`);
});





//------------------------------------------------------------//



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//console.log(generateRandomString())


