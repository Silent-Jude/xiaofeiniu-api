/**
 * 小肥牛扫码点餐系统API子系统
 */

const PORT = 8090;
const express = require('express')
const cors = require('cors')
const adminRouter = require('./routes/adminRouter')
const bodyParser = require('body-parser')
const app = express();

app.listen(PORT, () => {
  console.log('服务器启动成功！端口号是：' + PORT)
})

app.use(cors({
  origin: ['http://127.0.0.1:3006', 'http://127.0.0.1:5500'],
  credentials: true
}))

/*
  把application/x-www-form-urlencoded格式的请求主体数据解析出来，放入req.body属性
  app.use(bodyParser.urlencoded({
  extended: false 
})) */
app.use(bodyParser.json())
//把json格式的请求主体数据解析出来，放入req.body属性中

app.use(express.static(__dirname + '/public'))


app.use('/admin', adminRouter)