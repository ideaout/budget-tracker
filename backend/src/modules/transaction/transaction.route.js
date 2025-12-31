const express = require('express');
const router = express.Router();
const TransactionController = require('./transaction.controller');
const { createTransactionValidator, updateTransactionValidator, idParamValidator } = require('./transaction.validator');
const validateRequest = require('../../middlewares/validation.middleware');
const asyncErrorHandler = require('../../errors/asyncErrorHandler');
const authJWT = require('../../middlewares/auth.middleware');


router.use(authJWT);

router.get('/', 
    asyncErrorHandler(TransactionController.getAll.bind(TransactionController)));

router.get('/monthly-summary', 
    asyncErrorHandler(TransactionController.getMonthlySummary.bind(TransactionController)));

router.get('/monthly-chart', 
    asyncErrorHandler(TransactionController.getMonthlyChart.bind(TransactionController)));

router.get('/today', 
    asyncErrorHandler(TransactionController.getTodayTransaction.bind(TransactionController)));

router.get('/today-expense-stats', 
    asyncErrorHandler(TransactionController.getTodayExpense.bind(TransactionController)));

router.get('/:id',
    idParamValidator,
    validateRequest,
    asyncErrorHandler(TransactionController.getById.bind(TransactionController)));

router.post('/',
    createTransactionValidator,
    validateRequest,
    asyncErrorHandler(TransactionController.create.bind(TransactionController)));

router.put('/:id', 
    idParamValidator,
    updateTransactionValidator,
    validateRequest,
    asyncErrorHandler(TransactionController.update.bind(TransactionController)));

router.delete('/:id', 
    idParamValidator,
    validateRequest,
    asyncErrorHandler(TransactionController.delete.bind(TransactionController)));

module.exports = router;