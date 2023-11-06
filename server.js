const express = require('express');
const http = require('http');
const path = require('path');
const reload = require('reload');
const bodyParser = require('body-parser');
const logger = require('morgan');


const app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parses json, multi-part (file), url-encoded

app.use('/public', express.static('public'));
app.use('/pages', express.static('pages'));
app.use('/js', express.static('js'))

function getHandler(path, host, port) {
  app.get(path, (req, res) => {
    // 构建后端请求的选项
    const options = {
      hostname: host,
      port: port,
      path: path, // 将客户端请求的 URL 作为后端请求的路径
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie
      },
    };
    if (req.headers.cookie) {
      // 如果存在，则将Cookie头添加到headers对象中
      options.headers['Cookie'] = req.headers.cookie;
    }
  
    // 发送请求到后端服务器
    const backendRequest = http.request(options, (backendResponse) => {
      backendResponse.pipe(res); // 将后端服务器的响应传递给客户端
    });
  
    backendRequest.on('error', (error) => {
      console.error('Backend request error: ' + error.message);
      res.status(500).send('Backend request error');
    });
  
    backendRequest.end();
  });
}

function postHandler(path, host, port, callback) {
  app.post(path, (req, res) => {
    // 从请求中获取POST数据
    const requestData = req.body;
    console.log(requestData);
    // 创建一个HTTP请求选项，以便将请求转发到后端服务
    const options = {
      hostname: host, // 后端服务的URL
      port: port, // 后端服务的端口
      path: path, // 后端服务的特定端点
      method: 'POST',
      headers: req.headers
    };


    // 创建一个代理请求对象
    const proxyRequest = http.request(options, (proxyResponse) => {
      let data = '';

      // 监听后端服务的响应
      proxyResponse.on('data', (chunk) => {
        data += chunk;
      });

      // 监听后端服务的响应完成事件
      proxyResponse.on('end', () => {
        if (proxyResponse.headers['set-cookie']) {
          res.setHeader('set-cookie', proxyResponse.headers['set-cookie']);
        }
        callback(data, res);
      });
    });

    // 处理代理请求时可能出现的错误
    proxyRequest.on('error', (error) => {
      console.error(`代理请求错误: ${error.message}`);
      res.status(500).send('代理请求错误');
    });

    // 向后端服务发送POST数据
    proxyRequest.write(JSON.stringify(requestData));
    proxyRequest.end();
  });
}

postHandler('/register', 'localhost', 8080, function (data, res) {
  
  const jsonData = JSON.parse(data);
  console.log(jsonData);
  console.log(jsonData.code);
  if (jsonData.code >= 200 && jsonData.code < 300) {
    res.status(jsonData.code);
  } else {
    res.status(500);
  }
  res.send(data);
});

postHandler('/login', 'localhost', 8080, function (data, res) {
  const jsonData = JSON.parse(data);
  console.log(jsonData.code);
  if (jsonData.code >= 200 && jsonData.code < 300) {
    res.status(jsonData.code);
  } else {
    res.status(500);
  }

  res.send(data);
});

// getHandler('/user/info', 'localhost', 8080);

app.get('/:page.html', function (req, res) {
  const page = req.params.page;
  const filePath = path.join(__dirname, `${page}.html`);
  res.sendFile(filePath);
});

app.get('/js/:script.js', function (req, res) {
  const script = req.params.script;
  const filePath = path.join(__dirname, `${script}.js`);
  res.sendFile(filePath);
});


app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});



const server = http.createServer(app);

// Reload code here
reload(app)
  .then(function (reloadReturned) {
    // reloadReturned is documented in the returns API in the README

    // Reload started, start web server
    server.listen(app.get('port'), function () {
      console.log(
        'Web server listening on port http://localhost:' + app.get('port')
      );
    });
  })
  .catch(function (err) {
    console.error(
      'Reload could not start, could not start server/sample app',
      err
    );
  });
