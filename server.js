const fs = require('fs');
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const multer = require('multer');
const upload = multer();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(upload.any());
app.use(express.static(__dirname));
const privateKey = fs.readFileSync('./ssl/sign.key', 'utf8');
const certificate = fs.readFileSync('./ssl/sign.crt', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate,
};
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/create-user', (req, res) => {
    const { username, password, email } = req.body;
    const scriptPath = '/home/ubuntu/zotero-selfhost/bin/support/create-user-single.sh';
    exec(`cd '/home/ubuntu/zotero-selfhost/' && './bin/support/list-user.sh'`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка выполнения скрипта: ${error}`);
            res.status(500).json({ message: 'Error' });
            return;
        }
        const answ = stdout.replace(/mysql: [Warning] Using a password on the command line interface can be insecure./g, '');
        answ.replace(/email/g, '');
        answ.replace(/username/g, '');
        if (answ.indexOf(username) == -1 && answ.indexOf(email) == -1) {
            exec(`cd '/home/ubuntu/zotero-selfhost/' && './bin/support/create-user-single.sh' ${username} ${password} ${email} ${1000}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Ошибка выполнения скрипта: ${error}`);
                    res.status(500).json({ message: 'Error' });
                } else {
                    console.log(`Скрипт успешно выполнен: ${stdout}`);
                    res.status(200).json({ message: 'User created successfully' });
                }
            });
        } else {
            if (answ.indexOf(username) != -1 && answ.indexOf(email) != -1) {
                console.error(`User already exists with the provided username and email.`);
                res.status(403).json({ message: 'usernamemail' });
            } else if (answ.indexOf(username) != -1) {
                console.error(`User already exists with the provided username.`);
                res.status(403).json({ message: 'username' });
            } else if (answ.indexOf(email) != -1) {
                console.error(`User already exists with the provided email.`);
                res.status(403).json({ message: 'email' });
            }
        }
    });
});
app.use('/cors/:url(*)', (req, res, next) => {
    try {
        const targetUrl = new URL(req.params.url);
        const queryParams = new URLSearchParams(req.query).toString();
        const fullTargetURL = queryParams ? `${targetUrl.origin}${targetUrl.pathname}?${queryParams}` : targetUrl.href;
	res.header("Access-Control-Allow-Origin", "*");
    	res.header("Access-Control-Allow-Methods", "*");
    	res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
	
	if (req.method === 'OPTIONS') {
	 res.send();
	 } 
	else {
        if (!fullTargetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        
        
        console.log(fullTargetURL);
        
         const proxyRequestOptions = {
                url: fullTargetURL,
                method: req.method,
                headers: { ...req.headers }
            };
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/x-www-form-urlencoded')) {
                    proxyRequestOptions.form = req.body;
                } else  {
                    
                    proxyRequestOptions.json = true;
                    proxyRequestOptions.body = req.body;
                }
        
        
        request(proxyRequestOptions,
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
            }).pipe(res);
            
    }
}
     catch (error) {
        console.error('Invalid URL:', error);
        res.status(400).json({ error: 'Invalid URL' });
    }
});
// Создание HTTPS сервера
const httpsServer = https.createServer(credentials, app);
const httpsPort = 443; // порт для HTTPS
httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS сервер запущен на порту ${httpsPort}`);
});
// Создание HTTP сервера для перенаправления на HTTPS
const httpApp = express();
const excludedPorts = [8080, 8081, 8082, 8083, 8084, 8085];
httpApp.use((req, res) => {
    const host = req.headers.host;
    const port = host && parseInt(host.split(':')[1], 10);
    console.log(port);
    if (excludedPorts.includes(port)) {
        res.status(200).send('HTTP is allowed on this port');
    } else {
        res.redirect(`https://${req.headers.host}${req.url}`);
    }
});
const httpServer = http.createServer(httpApp);
const httpPort = 80; // порт для HTTP, который будет перенаправлять на HTTPS
httpServer.listen(httpPort, () => {
    console.log(`HTTP сервер запущен на порту ${httpPort} и перенаправляет на HTTPS`);
});

