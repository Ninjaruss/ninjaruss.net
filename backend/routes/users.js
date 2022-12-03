"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
const mongoose = require('mongoose');
/* GET users listing. */
router.get('/', function (req, res, next) {
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
    ];
    res.json(userTable);
});
module.exports = router;
