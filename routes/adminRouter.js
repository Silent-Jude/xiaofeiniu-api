const express = require('express')
const pool = require('../pool')
const router = express.Router()

module.exports = router;

//挂载于 /admin

/**
 * restful风格的api
 * api：GET /admin/category
 * 含义：客户端获取所有的菜品类别，按编号升序排列。
 * 返回值形如：
 * [{cid:1,cname:''...},{...}]
 */

router.get('/category', (req, res) => {
  var sql = 'select cid,cname from xfn_category order by cid asc'
  pool.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send(result)
    }
  })
})

/**
 *api：DELETE /admin/category/:cid
 * 含义：删除一个菜品类别。
 * 返回值形如：
 * {code: 200 , msg: '1 category deleted'}
 * {code: 400 , msg: '0 category deleted'}
 * 
 */
router.delete('/category/:cid', (req, res) => {
  //注意，删除菜品类别之前，必须先把属于该类别的菜品类别编号，置为null
  var cid = req.params.cid
  var sql = 'UPDATE xfn_dish set categoryId=null where categoryId=?'
  pool.query(sql, cid, (err, result) => {
    if (err) throw err;
    //至此，指定类别的菜品已经修改完毕，可以进行删除操作。
    var sql = 'delete from xfn_category where cid = ?'
    pool.query(sql, cid, (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.send({
          code: 200,
          msg: '1 category deleted'
        })
      } else {
        res.send({
          code: 400,
          msg: '0 category deleted'
        })
      }
    })
  })
})

/**
 *api：POST /admin/category          幂非等
 *请求参数：{cname:'xxx'}
 * 含义：添加新的菜品类别
 * 返回值形如：
 * {code: 200 , msg: '1 category added',cid: x}
 */
router.post('/category', (req, res) => {
  var obj = req.body;
  var cname = obj.cname;
  var sql = 'select cid from xfn_category where cname = ?'
  pool.query(sql, cname, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      //有重复
      res.send({
        code: -1,
        msg: '该菜品类别已存在，无法继续添加！'
      })
    } else {
      //无重复
      var sql = 'insert into xfn_category values (null,?)'
      pool.query(sql, cname, (err, result) => {
        if (err) throw err;
        res.send({
          code: 200,
          msg: '1 category add'
        })
      })
    }
  })
})

/**
 *api：PUT /admin/category
 *请求参数：{cid:xx,cname:'xxx'}
 * 含义：根据菜品类别编号修改该类型。
 * 返回值形如：
 * {code: 200 , msg: '1 category modified'}
 * {code: 400 , msg: '0 category modified, not exists'}表示类别不存在
 * {code: 401 , msg: '0 category modified,no modification'}表示类别存在，但是名字和以前一样
 */
router.put('/category', (req, res) => {
  var obj = req.body;
  var cname = obj.cname;
  var cid = obj.cid;
  //此处可以对输入数据进行验证
  var sql = 'UPDATE xfn_category set cname = ? where cid = ?'
  pool.query(sql, [cname, cid], (err, result) => {
    if (err) throw err;
    if (result.changedRows > 0) { //实际修改1行
      res.send({
        code: 200,
        msg: '1 category modified'
      })
    } else if (result.affectedRows == 0) { //影响到0行，即没有这个cid
      res.send({
        code: 400,
        msg: '0 category modified, not exists'
      })
    } else if (result.changedRows == 0 && result.affectedRows == 1) { //影响到1行，但是没有更新1行，说明没有改变。
      res.send({
        code: 401,
        msg: '0 category modified,no modification'
      })
    }
  })
})

/**
 * API: get /admin/login/:aname/:awpd
 * 完成用户登录验证(提示，有的项目中，此处会选择post请求)
 * 返回数据：
 * {code:200,msg:'login success'},
 * {code:400,msg:'aname or apwd err'}
 */
router.get('/login/:aname/:apwd', (req, res) => {
  var aname = req.params.aname;
  var apwd = req.params.apwd;
  var sql = 'select aid from xfn_admin where aname = ? and apwd = password(?)'
  pool.query(sql, [aname, apwd], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({
        code: 200,
        msg: 'login success'
      })
    } else {
      res.send({
        code: 400,
        msg: 'aname or apwd err'
      })
    }
  })
})

/**
 * API: PATCH /admin/login                幂等   修改部分数据用patch打补丁。
 * 请求数据：{aname:'xxx,newPwd:'xxx',oldPwd:'xxx'}
 * 根据管理员名和密码修改管理员密码。
 * 返回数据：
 * {code:200,msg:'modified success'}
 * {code:400,msg:'aname or apwd err'}用户名不存在或密码不存在
 * {code:401,msg:'apwd not modified'}
 */

router.patch('/', (req, res) => {
  var obj = req.body;
  var {
    aname,
    newPwd,
    oldPwd
  } = obj
  //首先根据aname/oldPwd来查询该用户是否存在
  //如果查询到了用户，在修改其密码
  var sql = 'select aid from xfn_admin where aname = ? and apwd = password(?)'
  pool.query(sql, [aname, oldPwd], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      //存在该用户
      if (newPwd == oldPwd) { //判断新旧密码是否相同
        res.send({
          code: 401,
          msg: 'apwd not modified'
        })
        return;
      }
      var sql = 'UPDATE xfn_admin set apwd=password(?) where aname = ?'
      pool.query(sql, [newPwd, aname], (err, result) => {
        if (err) throw err;
        if (result.affectedRows > 0) {
          res.send({
            code: 200,
            msg: 'modified success'
          })
        }
      })
    } else {
      //旧密码输入错误，无法修改
      res.send({
        code: 400,
        msg: 'password err'
      })
    }
  })
})


/**
 * API: GET /admin/dish
 * 获取所有的菜品，需要按照类别进行分门别类
 * 返回数据：
 * [
 * {cid:1,cname:'肉类',dishList:[{...},{...},.....]},
 * {cid:2,cname:'菜类',dishList:[{...},{...},.....]},
 *  ]
 */
router.get('/dish', (req, res) => {
  //查询所有的菜品类别
  pool.query('select cid , cname from xfn_category order by cid', (err, result) => {
    if (err) throw err;
    var categoryList = result; //菜品类别数组
    var count = 0
    for (let c of categoryList) {
      pool.query('select * from xfn_dish where categoryId = ? order by did desc', c.cid, (err, result) => {
        //这里有坑，count++写外面，最后的等于判断会发送2次响应导致报错？为什么发2次啊？
        //找到原因了，因为pool.query执行的是异步操作。而for循环是单线的，不会等异步操作做完才执行。所以for循环瞬间就执行完毕，此时的count早就等于5了，而异步操作此时可能还没执行。当5次异步操作准备执行时，count早就等于5，所以每次异步操作都会发送一次send，从而在第二次就导致了报错！
        count++;
        if (err) throw err;
        c.dishList = result;
        if (count == categoryList.length) {
          res.send(categoryList)
        }
      })
    }
  })
})




/**
 * API: post /admin/dish/image                      非幂等
 * 请求参数：
 * 接收客户端上传的菜品图片，保存在服务器上，返回这张图片在服务器上的随机文件名。
 */

//使用multer中间件。
const multer = require('multer')
const fs = require('fs')
const upload = multer({
  dest: 'tmp/' //指定客户端上传的文件临时存储路径。
})

router.post('/dish/image', upload.single('dishImg'), (req, res) => {
  // req.file 是 `avatar` 文件的信息
  // req.body 将具有文本域数据，如果存在的话
  // console.log(
  //   req.file, //客户端上传的图片。
  //   req.body) //客户端随同图片一起提交的字符数据
  //想办法吧客户端上传的文件，从临时目录转移到永久的图片路径下面。
  var tmpFile = req.file.path; //临时文件路径名
  var suffix = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')) //原始文件名中的后缀部分
  var newFile = randFileName(suffix)
  fs.rename(tmpFile, 'public/xiaofeiniu/admin/dish/' + newFile, () => {
    res.send({
      code: 200,
      msg: 'upload success',
      fileName: newFile //把临时文件转移。
    })
  })
})

//生成一个随机文件名
//参数：suffix表示要生成的文件名中的后缀
//形如：15123564-8854.jpg
function randFileName(suffix) {
  var time = new Date().getTime();
  var num = Math.floor(Math.random() * (10000 - 1000) + 1000)
  var name = `${time}-${num}.${suffix}`
  return name
}

router.post('/dish', (req, res) => {
  var obj = req.body;
  var {
    title,
    imgUrl,
    price,
    detail,
    categoryId
  } = obj
  var sql = 'insert into xfn_dish values (null,?,?,?,?,?);'
  pool.query(sql, [title, imgUrl, price, detail, categoryId], (err, result) => {
    if (err) throw err;
    //成功
    console.log(result)
    res.send({
      code: 200,
      msg: 'dish add secc',
      dishId: result.insertId
    })
  })
})