const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = 3000;

const dbConfig = {
    host: "",
    user: "root",
    password: "123456",
    database: "users",
    port: 3306
};

// JSON
/*

{
id: 1
name: Allan

}

*/

app.use(express.json()); //express.json() -> middleware 

//POST,GET,PUT,PATCH,DELETE
// "api/register" enpoint > hhtps://localhost/api/register"
app.post("/api/register", async (req, res) => { //everytime we want create something 
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({error: "All Fields are Required"})
    }

    try{
        const conn = await mysql.createConnection(dbConfig);

        const query = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
        await conn.execute(query, [name,email,password]);
        await conn.end();
        res.status(201).json({message: "created with success"});


    }catch(e){
        res.status(500).json({error: "Something happens in the server"});
    }
});

app.get("/api/register", async (req,res) => {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const [rows] = await conn.execute("SELECT * FROM users");
        await conn.end();
        res.status(200).json(rows); //array of ojects with our data

    }catch (e){
       res.status(500).json({error: "Fail"});
    }
});

//
app.get("/", async (req,res) => {
    
    res.status(200).json({message: "API is running"}); //array of ojects with our data
});


//

async function initDatabase() {
    try {
        const conn = await mysql.createConnection(dbConfig);
        const tables = await conn.query("SHOW TABLES like 'users'");

        if(tables.length === 0){
            const createTableQuery = `
             CREATE TABLE user{
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                email VARCHAR(200) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            };
            `;

            await conn.query(createTableQuery);
            console.log("Table created");
        }

        await conn.end();

    }catch(error){
        console.log("Database error", error);
        process.exit(1);
    }
}

initDatabase().then(() => {
    app.listen(port, () => {
        console.log(`The server is running, PORT: ${port}`)
    })
})
