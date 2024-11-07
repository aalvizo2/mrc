//libraries
const express= require('express')
const Router= express.Router()
const fileUpload= require('express-fileupload')
const mysql= require('mysql')
var conn= require('./login.js')
const connection= require('./db')


//middlewares
Router.use(fileUpload())
Router.use(express('public'))
Router.use(express('upload'))



  module.exports= Router