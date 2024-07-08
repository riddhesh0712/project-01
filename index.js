const express = require("express")
const users = require("./MOCK_DATA.json")
const fs = require("fs")
const app = express()

const filePath = './MOCK_DATA.json';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/users", (req, res) => {
    const html= `
        <ul>
            ${users.map(user => `<li>${user.first_name}</li>`).join("")}
        </ul>
    `
    res.send(html)
})

app.get("/api/users", (req, res) => {
        return res.json(users)
    })
    .post("/api/users", (req, res) => {
        // const header = req.header
        // console.log(header)
        const body = req.body
        const newUser = { ...body, id: users.length + 1 };
        users.push(newUser);
        fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ status: "error", message: "Failed to save user data" });
            }
            return res.json({ status: "success", id: newUser.id });
        });
    })
    

app.get("/api/users/:id", (req, res) => {
        const id = Number(req.params.id)
        const user = users.find((user) => user.id === id)
        return res.json(user)
    })
    .patch("/api/users/:id", (req, res) => {
        const body = req.body;
        const id = Number(req.params.id);
    
        // Read the file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading the file:", err);
                return res.status(500).json({ status: "error", message: "Failed to read user data" });
            }
    
            let users;
            try {
                // Parse the data into a JavaScript array
                users = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing JSON:", parseErr);
                return res.status(500).json({ status: "error", message: "Failed to parse user data" });
            }
    
            // Find the index of the user
            const userIndex = users.findIndex((user) => user.id === id);
            if (userIndex === -1) {
                return res.status(404).json({ status: "error", message: "User not found" });
            }
    
            // Update the user
            users[userIndex] = { ...users[userIndex], ...body };
    
            // Write the updated users array back to the file
            fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
                if (err) {
                    console.error("Error writing to the file:", err);
                    return res.status(500).json({ status: "error", message: "Failed to save user data" });
                }
                return res.json({ status: "success", id: id });
            });
        });
    });
app.listen(8000, () => console.log("Server Started"))