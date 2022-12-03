import express, {Request, Response, Router} from "express";
let router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.send('index')
});

export {router};