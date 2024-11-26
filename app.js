import express from "express";
import bodyParser from "body-parser";
import { readFile } from 'node:fs';
import { writeFile } from 'node:fs';

const port = 3000;
const app = express();

//public'in static dosyalar içerdiğini bu ara yazılım ile söylüyorum.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", (req,res)=>{
    res.render("index.ejs");
});

app.get("/sign-in", (req, res)=>{
    res.render("sign-in.ejs");
});

app.get("/log-in", (req, res)=>{
    res.render("log-in.ejs");
});

app.post("/sign-info", (req, res)=>{

    const newUser = req.body; // Gelen POST verisi
    const newEmail = req.body["email"]; // Gelen e-posta adresi
    let users = [];
    
    // json dosyasını okudum ve verileri dataya aldım.
    readFile('user-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

    if (data) {
        users = JSON.parse(data); // json verisini javascript objesine döndürdüm. ve users dizisine koydum. [obj1, obj2...]
    }
    // JSON içinde e-posta adresi var mı diye kontrol. user dizisi içinde email gelen email ile aynı var mı diye arıyor. 
    const userExists = users.some(user => user["email"] === newEmail);


    // eğer email daha önceden varsa status code dönüyor.
    if (userExists) {
        return res.status(400);
    }

    // Eğer yoksa, yeni kullanıcı olarak ekleniyor.
    users.push(newUser);

    //JSON.stringify(users, null, 2) null parametresi replacer yerine geçer. hangi özelliklerin jsona dahil edileceğini söyler. eğer null kullanırsak tüm özellikleri dahil eder. 2 de girinti için. her seviye için 2 boşluk ekler.
    //JSON.stringify ile js objesini tekrar json formatına çevirdim.
    writeFile('user-data.json', JSON.stringify(users, null, 2), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        console.log('New User Added Successfully');
            res.status(200).render("user-index.ejs", {userName: req.body["fname"]});
        }); 
    });
});

app.post("/login-info", (req, res)=>{

    const userEmail = req.body["email"];
    const userPassword = req.body["pwd"];

    readFile('user-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        console.log(data);

        let users_info = [];

        if(data){
            users_info = JSON.parse(data);
        }
        
        // E-posta ve şifreyi kontrol
        const user = users_info.find(user => user["email"] === userEmail && user["pwd"] === userPassword);

        if (user) {
            res.status(200).render("user-index.ejs", {userName: user["fname"]});
        }else {
            res.status(400);
        }
    });
});


app.listen(port, ()=>{
    console.log(`Server running on ${port} port.`)
});
