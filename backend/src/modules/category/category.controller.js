const CategoryService = require('./category.service');

class CategoryController {
    async getAll(req, res, next) {
        try {
            const categories = await CategoryService.getAll();
            res.json({success: true, message: "kategori berhasil didapat", data: categories})
        } catch (error) {
            next(error)
        }
    }

    async getById(req, res, next) {
        try {
            const category = await CategoryService.getById(req.params.id);
            res.json({success: true, message: "kategori berhasil didapat", data: category})
        } catch (error) {
            next(error)
        }
    }

    async create(req, res, next) {
        try {
            const category= await CategoryService.create(req.body);
            res.json({success: true, message: "kategori berhasil dibuat", data: category})
        } catch (error) {
            next(error)
        }
    }

    async update(req, res, next) {
        try {
            const category = await CategoryService.update(req.params.id, req.body);
            res.json({success: true, message: "kategori berhasil diupdate", data: category})
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const category = await CategoryService.delete(req.params.id);
            res.json({success: true, message: "kategori berhasil dihapus", data: category})
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CategoryController();