
import User from "./user.model.js";
import bcrypt from "bcrypt";
import { checkPassword, encrypt } from '../../utils/encrypt.js';


export const getAll = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) return res.status(404).send({ message: "Users not found" });
        return res.send({ message: "Users found: ", users });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "General error", err });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.password) {
            return res.status(400).json({ message: "Use the password update function instead" });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
}


export const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Usa la misma función checkPassword que usaste en el login
        const isMatch = await checkPassword(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Usa la misma función encrypt que usaste para crear el usuario
        user.password = await encrypt(newPassword);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating password", error: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ message: "User deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error })
    }
}
