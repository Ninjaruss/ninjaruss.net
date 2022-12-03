import express, {Request, Response} from "express";
var router = express.Router();
const mongoose = require('mongoose')

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: any) {
    const userTable = [
      {
        id: 1, 
        username: "ninjaruss",
        hoursWorked: 200,
        basePay: 17.50
      }, 
      {
        id: 2,
        username: "L bozo",
        hoursWorked: 300,
        basePay: 17.50
      }
    ]
  
    res.json(userTable)
});

module.exports = router;