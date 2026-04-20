const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const { data } = require('./data/lens.json');

// 全域日誌紀錄中間件
app.use((req, res, next) => {
    const log = `[${new Date().toLocaleString()}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(path.resolve(__dirname, './access.log'), log);
    next();
});

// 開放靜態資源
app.use(express.static(path.resolve(__dirname, './public')));

// 首頁路由
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
});

// 動態產品路由
app.get('/product/:model', (req, res) => {
    const modelParam = req.params.model.replace(/\.html$/, '');
    const product = data.find(item => item.model === modelParam);

    if (!product) {
        return res.status(404)
            .set('Content-Type', 'text/html; charset=utf-8')
            .send('<h1>404 找不到型號</h1>');
    }

    res.send(`
        <div style="text-align:center; font-family:sans-serif;">
            <h1>產品資訊 (Product Info)</h1>
            <hr>
            <h2>${product.name}</h2>
            <p>型號：${product.model}</p>
            <img src="${product.imageUrl}" alt="${product.name}" style="width:400px;">
            <br><br>
            <a href="/">回首頁 (Back to Home)</a>
        </div>
    `);
});

// 受保護的管理後台路由
app.get('/admin', (req, res) => {
    const isAuth = req.query.code === '521';
    const message = isAuth ? 'Welcome to Admin (歡迎進入後台)' : 'Access Denied (暗號錯誤)';
    res.status(isAuth ? 200 : 403)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send(`<h1 style="text-align:center;">${message}</h1>`);
});

// 萬用 404 頁面
app.all('/{*splat}', (req, res) => {
    res.status(404)
        .set('Content-Type', 'text/html; charset=utf-8')
        .send('<h1 style="text-align:center; padding-top:50px;">404 Not Found (抱歉，路徑不存在)</h1>');
});

app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});