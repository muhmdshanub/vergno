const asyncHandler = require("express-async-handler");
const Admin = require("../models/admin.js");
const generateAdminToken = require("../utils/generateAdminJwtToken.js");


//@desc auth admin / set token
//route POST /api/admin/auth
//@access public

const authAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        generateAdminToken(res, admin._id);

        const adminData = {
            _id: admin?._id,
            name: admin?.name,
        };

        res.status(200).json({message:"veriifed login",adminData});
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

//@desc register admin
//route POST /api/v1/admin/signup
//@access public

const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
        res.status(400);
        throw new Error("Admin user already exists");
    }

    // If no image is provided, create a new user without image details
    const admin = await Admin.create({
        name,
        email,
        password,
    });

    if (admin) {
        generateAdminToken(res, admin._id);

        const adminData = {
            _id: admin._id,
            name: admin.name,
        };

        res.status(201).json({message:"Admin created successfully",adminData});
    } else {
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

//@desc logout admin
//route POST /api/v1/admin/logout
//@access private
const logoutAdmin = asyncHandler(async (req, res) => {
    res.cookie("admin_Jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Admin logged out." });
});



module.exports = {
    authAdmin,
    registerAdmin,
    logoutAdmin,
};