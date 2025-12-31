const UserService = require('./user.service');
const NotFound = require('../../errors/NotFoundError');

class UserController {
    async getAll(req, res, next){
        try{
            const users = await UserService.getAll();
            if(users.length === 0) throw new NotFound("Data Users belum ada boi")
            res.json({
                success: true,
                message: "User berhasil di dapat!",
                data: users
            })
        } catch(err){
            next(err)
        }
    }

    async getById(req, res, next) {
        try{
            const user = await UserService.getById();
            if(!user) throw new NotFound("Data Users belum ada boi")
            res.json({
                success: true,
                message: "User berhasil di dapat!",
                data: users
            })
        } catch(err){
            next(err)
        }
    }

    async create(req, res, next) {
        try {
            const user = await UserService.create(req.body);
            res.status(201).json({success: true, message: "User behasil dibuat", data: user})
        } catch (err){
            next(err)
        }
    }

    async update(req, res, next) {
        try {
            const user = await UserService.update(req.params.id, req.body);
            if(!user) throw new NotFound("Data User tidak ditemukan");
            res.status(200).json({success: true, message: "User berhasil di update", data: user});
        } catch (err){
            next(err)
        }
    }

    async delete(req, res, next) {
        try {
            const user = await UserService.delete(req.params.id);
            if(!user) throw new NotFound("Data User tidak ditemukan");
            res.status(200).json({success: true, message: "Data berhasil di hapus"});
        } catch (err){
            next(err)
        }
    }
}

module.exports = new UserController();