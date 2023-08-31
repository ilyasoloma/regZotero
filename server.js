const hostname = '192.168.62.81';
const port = 3000;
var cors = require('cors')
const http = require('http');
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json()); 
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/create-user', (req, res) => {
    const { username, password, email} = req.body;
    //const scriptPath = '/var/www/zotero/admin/create-user.sh';
    const scriptPath = '/home/ubuntu/zotero-selfhost/bin/support/create-user-single.sh';
   exec(`cd '/home/ubuntu/zotero-selfhost/' && './bin/support/create-user-single.sh' ${username} ${password} ${email} ${1000}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка выполнения скрипта: ${error}`);
            res.status(500).send('Ошибка сервера');
        } else {
            console.log(`Скрипт успешно выполнен: ${stdout}`);
            res.status(200).json({ message: 'User created successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
