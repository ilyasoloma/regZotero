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
    exec(`cd '/home/ubuntu/zotero-selfhost/' && './bin/support/list-user.sh'`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка выполнения скрипта: ${error}`);
            res.status(500).json({ message: 'Error' });
        } 
        const answ = stdout.replace(/mysql: [Warning] Using a password on the command line interface can be insecure./g, '');
        answ.replace(/email/g,'');
        answ.replace(/username/g,'');
        if (answ.indexOf(username) == -1 && answ.indexOf(email) == -1){
        	exec(`cd '/home/ubuntu/zotero-selfhost/' && './bin/support/create-user-single.sh' ${username} ${password} ${email} ${1000}`, (error, stdout, stderr) => {
        	if (error) {
            	console.error(`Ошибка выполнения скрипта: ${error}`);
            	res.status(500).json({ message: 'Error' });
        	} else {
            	console.log(`Скрипт успешно выполнен: ${stdout}`);
            	res.status(200).json({ message: 'User created successfully' });
        }
    });
        }
        else{
        if (answ.indexOf(username) != -1 && answ.indexOf(email) != -1){
        	console.error(`User already exists with the provided username and email.`);
        	res.status(403).json({ message: 'usernamemail' });
        }
        else if (answ.indexOf(username) != -1){
        	console.error(`User already exists with the provided username.`);
        	res.status(403).json({ message: 'username' });
        }
        else if (answ.indexOf(email) != -1){
        	console.error(`User already exists with the provided email.`);
        	res.status(403).json({ message: 'email' });
        }
        }
    });
});
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

