import express from "express";
import bodyParser from "body-parser";
import { readFile } from 'node:fs';
import { writeFile } from 'node:fs';
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import session from "express-session";

const port = 3000;
const app = express();
let events = [];
let users = [];

// session middleware
app.use(session({
    secret: 'secretkey123', // hardcoded olarak yapmak daha iyi ama şimdilik böyle.
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 86400000, httpOnly: true } 
}));

//public'in static dosyalar içerdiğini bu ara yazılım ile söylüyorum.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req,res)=>{

    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.sendStatus(500);
        }
        if (data) {
            events = JSON.parse(data);
        }

        const userName = req.session.userName || "Guest";
        res.locals.events = events; //user sayfasında eklenen eventlerin ana sayfadada  gözükebilmesi için verileri göndermem gerekiyordu. res locals ile orda oluşan verilere ulaşmayı sağladım.
        res.locals.showDropdown = false; 

        res.render("index.ejs");
    });
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

    newUser.id = uuidv4();

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

            res.status(200).render("log-in.ejs");
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

        //console.log(data);

        let users_info = [];

        if(data){
            users_info = JSON.parse(data);
        }
        
        // E-posta ve şifreyi kontrol
        const user = users_info.find(user => user["email"] === userEmail && user["pwd"] === userPassword);

        if (user) {
            req.session.userId = user["id"];
            req.session.userName = user["fname"];

            readFile('event-data.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading the event data file:', err);
                    return res.sendStatus(500);
                }

                let events = [];
                if (data) {
                    events = JSON.parse(data);
                }

                res.status(200).render("user-index.ejs", { 
                    userName: req.session.userName, 
                    events: events
                });
            });
        } else {
            res.status(400).render("log-in.ejs", { errorMessage: "Invalid email or password" });
        }
    });
});

/* form verilerinden dosya alabilmek için multer npm package kullandım.
indirip import ettikten sonra gelecek dosyaları kaydedilecek hedef path oluşturdum. */
const upload = multer({ dest: 'public/uploads/' });

app.post('/add-event', upload.single('image'), (req,res)=>{
    //console.log(req.body);
    //console.log(req.file);

    const eventData = {
        id: uuidv4(), // her etkinliğe benzersiz id vermek için uuid kütüphanesi kullandım.
        name: req.body["eventName"],
        img: req.file.filename,
        date: req.body["date"],
        location: req.body["location"],
        content: req.body["event-content"],
        price: req.body["price"]
    }

    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

    if (data) {
        events = JSON.parse(data); // json verisini javascript objesine döndürdüm. ve users dizisine koydum. [obj1, obj2...]
    }

    events.push(eventData);// objeyi events dizisine ittim.
    //console.log("events: " + events.length);
    //console.log(eventData.id);

    writeFile('event-data.json', JSON.stringify(events, null, 2), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        console.log('New Event Added Successfully');

            // Kullanıcı adını session'dan alıyorum.
            const userName = req.session.userName || "Guest";

            res.locals.events = events;
            res.locals.userName = userName;
            res.locals.showDropdown = true; 
        
            res.redirect('/user'); // post işlemi double submisson olmasın diye redirect ile başka endpointe yolladım.
        }); 
    });
});

// bu endpointte de render etmek istediğim asıl sayfayı koydum. böylece aynı sayfadayım ama post tekrarlanmıyor.
app.get('/user', (req, res) => {
    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.sendStatus(500);
        }
        if (data) {
            events = JSON.parse(data);
        }

        const userName = req.session.userName;
        res.locals.events = events;
        res.locals.userName = userName;
        res.locals.showDropdown = true; 

        res.render("user-index.ejs", { 
            userName: userName, 
            events: events 
        });
    });
});

app.delete("/events/:id", (req, res)=>{
    /* req.params, Express.js içinde URL'ye dahil olan dinamik parametreleri tutan bir nesnedir. Örneğin, bir rota tanımlarken, 
    URL'ye belirli değerler yerleştirildiğinde bu değerler req.params içinde erişilebilir hale gelir.  */
    const dataId = req.params.id;

    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.sendStatus(500);
        }

        if (data) {
            events = JSON.parse(data);
        }

        const eventIndex = events.findIndex(event => event.id === dataId);

        if (eventIndex !== -1) {
            // Etkinliği array'den silme
            events.splice(eventIndex, 1);

            writeFile('event-data.json', JSON.stringify(events, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to the file:', err);
                    return res.sendStatus(500);
                }

                console.log('Event deleted successfully from JSON file');
                res.sendStatus(204);
            });
        } else {
            console.log('Event not found');
            res.sendStatus(404);
        }
    });
});

app.use(bodyParser.json());


/* dizi içinde id eşleşen objeyi buluyorum bu obje varsa eğer 204 kodunu gönderiyorum ve eski değerlere yeni girdileri atıyorum. */
app.put("/events/:id", upload.single('image'), (req, res) =>{
    const dataId = req.params.id;
    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.sendStatus(500);
        }

        if (data) {
            events = JSON.parse(data);
        }

        const eventData = events.find((eventObject) => eventObject.id === dataId);

        if (eventData) {
            eventData.name = req.body.editEventName;
            eventData.img = req.file.filename;
            eventData.date = req.body.editDate;
            eventData.location = req.body.editLocation;

            writeFile('event-data.json', JSON.stringify(events, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to the file:', err);
                    return res.sendStatus(500);
                }

                console.log('Event updated successfully');
                res.sendStatus(204);
            });
        } else {
            console.log('Event not found');
            res.sendStatus(404);
        }
    });
}); 

app.get("/userProfile", (req, res) => {
    const userName = req.session.userName || "Guest";
    console.log('Session data on profile page:', req.session);
    res.status(200).render("user-profile.ejs", { userName: userName});
    
});

app.post("/edit-profile", (req, res) => {
    const editUser = req.body; // Gelen POST verisi
    //console.log(editUser);

    const userId = req.session.userId;
    console.log("Session Data For Edit: " + req.session);

    readFile('user-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.sendStatus(500);
        }

        if (data) {
            users = JSON.parse(data);
        }

        // Kullanıcıyı ID'ye göre arıyorum
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex !== -1) {
            // Kullanıcı varsa eski bilgileri yeni bilgiler ile değiştirdim.
            users[userIndex].fname = editUser.fname || users[userIndex].fname;
            users[userIndex].lname = editUser.lname || users[userIndex].lname;
            users[userIndex].email = editUser.email || users[userIndex].email;
            users[userIndex].pwd = editUser.pwd || users[userIndex].pwd;

            writeFile('user-data.json', JSON.stringify(users, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing the file:', err);
                    return res.sendStatus(500);
                }

                console.log('Kullanıcı bilgileri başarıyla güncellendi');
                res.redirect('/');
            });
        } else {
            console.log('Kullanıcı bulunamadı');
            res.sendStatus(404);
        }
    });
});

app.get("/event-detail/:id", (req, res) => {
    const eventId = req.params.id;

    readFile('event-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        if (data) {
            events = JSON.parse(data); // JSON verisini JavaScript objesine döndürdük.
        }

        // id ile eşleşen etkinliği buluyoruz
        const event = events.find(event => event.id === eventId);

        if (!event) {
            // Eğer etkinlik bulunamazsa 404 hata kodu döndürüyoruz
            return res.status(404).send('Event not found');
        }

        // Bulunan tek etkinliği render ediyoruz
        res.render("event-detail.ejs", { event: event });
    });
});

app.post("/payment", (req, res)=>{
    //console.log(req.body);

    if (req.body) {
        res.status(200).render("user-index.ejs", { successMesage: "Payment Successful" });
    }else {
        res.status(400).render("event-detail.ejs", { errorMessage: "Payment Failed" });
    }
});

app.listen(port, ()=>{
    console.log(`Server running on ${port} port.`);
});
