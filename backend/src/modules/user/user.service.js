const { User } = require('../../../models');
const bcrypt = require('bcrypt');
const NotFound = require('../../errors/NotFoundError');

class UserService {
    constructor() {
        this.SALT_ROUNDS = 10;
    }
    async getAll(){
        return await User.findAll({attributes: { exclude: ['password']}})
    }

    async getById(id) {
        return await User.findByPk(id, { attributes: { exclude: ['password'] } });
    }

    async create(data) {
        const existingUser = await User.findOne({
            where: {email: data.email}
        });

        if(existingUser){
            throw new BadRequestError("Email sudah terdaftar")
        }

        const hash = await bcrypt.hash(data.password, this.SALT_ROUNDS);

        const user = await User.create({ ...data, password: hash});
        const userJson = user.toJSON();
        delete userJson.password;

        return userJson;
    }

    async update(id, data){
        const user = await User.findByPk(id);
        if(!user) return null;

        if(data.email && data.email !== user.email){
            const existingUser = await User.findOne({
                where: {email: data.email}
            })

            if(existingUser){
                throw new BadRequestError("Email sudah terpakai");
            }
        }

        if(data.password){
            data.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
        } else {
            delete data.password;
        }

        try {
            await user.update(data, { validate: true });
        } catch (err) {
            console.error("error", err)
            const message = err.errors?.map(e => e.message) || [err.message];
            throw new ServerError("Gagal Update user: " + message.join(', '));
        }

        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    async delete(id) {
        const user = await User.findByPk(id);
        if(!user) throw new NotFound("User tidak ditemukan!");
        await user.destroy();
        return true;
    }
}

module.exports = new UserService();