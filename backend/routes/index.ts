import express, {Request, Response, Router} from "express";
let router = Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: any) {
  return res.send('index')
});

export {router};