import User from '../user/user.model.js'
import { checkPassword, encrypt } from "../../utils/encrypt.js"
import { generateJwt } from '../../utils/jwt.js'

export const register = async (req, res) => {
    try {
        let data = req.body;
        let user = new User(data);
        user.password = await encrypt(user.password);
        
        // Establecer el rol
        if (req.user && req.user.role === 'ADMIN' && data.role) {
            user.role = data.role;
        } else {
            user.role = 'CLIENT';
        }
        
        await user.save();
        return res.send({ message: `Registered successfully, can be logged with username: ${user.username}` });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error with registering user', err });
    }
};

export const login = async (req, res) => {
    try {
        let { username, password } = req.body;
        let user = await User.findOne({ username });
        
        if (!user) {
            return res.status(400).send({ message: 'Wrong username or password' });
        }
        
        // Comparar la contraseña correctamente
        const passwordMatch = await checkPassword(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send({ message: 'Wrong username or password' });
        }
        
        let loggedUser = {
            uid: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        };
        let token = await generateJwt(loggedUser);
        
        return res.send({
            message: `Welcome ${user.name}`,
            loggedUser,
            token
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error with login function' });
    }
};
