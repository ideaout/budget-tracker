const MonthlySummaryService = require('./monthlySummary.service');

class MonthlySummaryController{
    async getAll(req, res, next){
        try {
            const data = await MonthlySummaryService.getAll();
            res.json({success: true, message: "List daftar summary bulanan", data})
        } catch (error) {
            next(error)
        }
    }

    async getById(req, res, next){
        try {
            const data = await MonthlySummaryService.getById(req.params.id);
            res.json({success: true, message: "Data summary bulanan", data})
        } catch (error) {
            next(error)
        }
    }

    async create(req, res, next){
        try {
            const data = {
                ...req.body,
                user_id: req.userId
            };
            const result = await MonthlySummaryService.create(data);
            res.status(201).json({success: true, message: "Membuat summary bulanan", data: result})
        } catch (error) {
            next(error)
        }
    }

    async update(req, res, next){
        try {
            const data = await MonthlySummaryService.update(req.params.id, req.body);
            res.json({success: true, message: "Summary bulanan telah terupdate", data})
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next){
        try {
            const data = await MonthlySummaryService.delete(req.params.id);
            res.json({success: true, message: "Summary bulanan telah terhapus", data})
        } catch (error) {
            next(error)
        }
    }

    async generate(req, res, next){
        try {
            const userId = req.userId
            const summary = await MonthlySummaryService.generate(userId)

            res.status(201).json({
                success: true, 
                message: "Summary bulanan berhasil dibuat", 
                data: summary
            })

        } catch (error) {
            next(error)
        }
    }
}

module.exports = new MonthlySummaryController();