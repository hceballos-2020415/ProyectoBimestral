import User from '../user/user.model.js'
import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'

const generateAdministratorAccount = async function () {
    try {
        const adminExists = await User.findOne({ role: 'ADMIN' });

        if (!adminExists) {
            const securePassword = await encrypt('HolaProfeNoj.#')

            const adminData = {
                name: 'Hettson',
                surname: 'Ceballos',
                email: 'hettsonceb@gmail.com',
                username: 'Frezzy0415',
                phone: '47182759',
                password: securePassword,
                role: 'ADMIN'
            }

            const newAdmin = new User(adminData);
            await newAdmin.save();
            console.log("Administrator user created successfully.");
        } else {
            console.log("A user with administrator role already exists.");
        }
    } catch (error) {
        console.error("Error creating administrator:", error);
    }
}

export const login = async(req, res) => {
    try {
        // Capturar los datos (body)
        let { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required' });
        }

        // Validar que el usuario exista
        let user = await User.findOne({ username });

        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        // Verificar que la contraseña coincida
        const passwordMatch = await checkPassword(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send({ message: 'Incorrect password' });
        }

        let loggedUser = {
            uid: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        }

        // Generar el Token
        let token = await generateJwt(loggedUser)

        // Responder al usuario
        return res.send({
            message: `Welcome ${user.name}`,
            loggedUser,
            token
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'General error with login function' });
    }
}


//Register
export const register=async(req,res)=>{
    try{
        //Capturar los datos
        let data = req.body
        //Crear elobjeto del modelo agregandole los datos capturados
        let user = new User(data)
        //Encriptar la password(2)
        user.password = await encrypt(user.password)
        //Asignar rol por defecto
        user.role = 'CLIENT'
        //Guardar
        await user.save()
        //Responder al usuario
        return res.send({message: `Registered succesfully, can be logged with username: ${user.username}`})
    }catch(e){
        console.error(e)
        return res.status(500).send({message: 'General error with user registration'})
    }
}

generateAdministratorAccount()
