var User = require('./user.js');
var express = require('express');
var router = express.Router();
var md5 = require('blueimp-md5');
router.get('/', function (req, rsp) {
    rsp.render('index.html', {user: req.session.user})
});
router.get('/login', function (req, rsp) {
    rsp.render('login.html')
})
router.post('/login', function (req, rsp) {
    var body = req.body;
    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function (erro, user) {
        if (erro) {
            return rsp.status(500).json({
                err_code: 500,
                message: erro.message
            })
        }
        if (!user) {
            return rsp.status(200).json({
                err_code: 1,
                message: 'Email or password is invalid.'
            })
        }
        req.session.user = user
        rsp.status(200).json({
            err_code: 0,
            message: 'OK'

        })
    })
});
router.get('/register', function (req, rsp) {
    rsp.render('register.html')
})
router.post('/register', function (req, rsp) {
    var body = req.body;
    User.findOne({
        $or: [{email: body.email}, {nickname: body.nickname}]
    }, function (erro, data) {
        if (erro) {
            return rsp.status(500).json({
                success: false,
                message: '服务端错误'
            })
        }
        if (data) {
            return rsp.status(200).json({
                err_code: 1,
                message: '用户名或者邮箱已存在'
            })
        }
        body.password = md5(md5(body.password));
        new User(body).save(function (erro, user) {
            if (erro) {
                return rsp.status(500).json({
                    err_code: 500,
                    message: 'Internal error.'
                })
            }
            req.session.user = user
            rsp.status(200).json({
                err_code: 0,
                message: 'OK'
            })
        })
    })
})
router.get('/logout', function (req, rsp) {
    req.session.user = null;
    rsp.redirect('/login')
})
module.exports = router;