const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/user.js");
const BlockUser = require('../models/blockUser.js')
const Follow = require('../models/follow.js')
const TempUser = require("../models/tempUser.js");
const TopicFollow = require('../models/topicFollow.js')
const sendOtpEmail = require("../utils/sendOtpEmail.js");
const generateUserToken = require("../utils/generateJwtToken.js");
const { OAuth2Client } = require('google-auth-library');
const Otp = require('../models/forgotPasswordOtp.js');
const EmailOtp = require('../models/updateEmailOtp.js')
const cloudinary = require('../configs/cloudinary');
const jwt = require('jsonwebtoken');



//@desc register new user
//route POST /api/v1/users/register
//@access public


const registerUser = asyncHandler(async (req, res) => {
    
    console.log(req.body)

    const { name, email, password, dob, gender } = req.body;
    let url;
    let public_id;

    if (req?.file?.path && req?.file?.filename) {
        url = req.file.path;
        public_id = req.file.filename;
    }

    if (!name || !email || !password || !dob || !gender) {
        res.status(400);
        throw new Error("Name, email, password, dob, and gender are required");
    }

    try {
        // Check if a user with the provided email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

        const tempUserData = {
            name,
            email,
            password,
            dob,
            gender,
            otp,
        };

        if (url && public_id) {
            tempUserData.image = {
                url,
                public_id
            };
        }

        // Upsert temporary user document
        const filter = { email };
        const update = {
            ...tempUserData,
            expiresAt: new Date() // Reset expiration time
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const tempUser = await TempUser.findOneAndUpdate(filter, update, options);

        // Send OTP to user's email via Nodemailer
        await sendOtpEmail(email, otp);

        // Respond with success message and appropriate data
        res.status(201).json({
            message: "Temporary user created successfully",
            tempUser: {
                _id: tempUser._id,
                email: tempUser.email,
                imageInfo:tempUser.image ? tempUser.image : null,
                otpSentAt: tempUser.updatedAt || new Date() // Timestamp when OTP was sent
            }
        });
    } catch (error) {
        // Handle errors
        res.status(500);
        throw new Error("Error registering user: " + error.message);
    }
});


//@desc resendOtp
//route POST /api/v1/users/resend-otp
//@access public


const resendEmailOtp = asyncHandler(async (req, res) => {
    
    const { name, email, password, dob, gender, imageInfo } = req.body;

    try {
        // Check if a user with the provided email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists");
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const otpSentAt = new Date()

        const tempUserData = {
            name,
            email,
            password,
            dob,
            gender,
            otp,
            otpSentAt,
        };

        if (imageInfo && imageInfo.url && imageInfo.public_id) {
            tempUserData.image = {
                url: imageInfo.url,
                public_id: imageInfo.public_id
            };
        }

        // Upsert temporary user document
        const filter = { email };
        const update = {
            ...tempUserData,
            expiresAt: new Date() // Reset expiration time
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const tempUser = await TempUser.findOneAndUpdate(filter, update, options);

        // Send OTP to user's email via Nodemailer
        await sendOtpEmail(email, otp);

        // Respond with success message and appropriate data
        res.status(201).json({
            message: "OTP has been resent successfully",
            tempUser: {
                _id: tempUser._id,
                email: tempUser.email,
                imageInfo: tempUser.image ? tempUser.image : null,
                otpSentAt: tempUser.updatedAt || new Date() 
            }
        });
    } catch (error) {
        // Handle errors
        res.status(500);
        throw new Error("Error resending OTP: " + error.message);
    }
});


//@desc register new user verify otp
//route POST /api/v1/users/verify-otp
//@access public

const verifyEmailOtp = asyncHandler(async (req, res) => {
    const { email, otp, tempUserId } = req.body;
  
   
  
    // Check if there is a matching email, tempUser_id, and OTP in temp users
    const tempUser = await TempUser.findOne({ _id: tempUserId, email, otp });
    if (!tempUser) {
      res.status(400);
      throw new Error("Invalid OTP or tempUserId");
    }
  
    const userData = {
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        dob: tempUser.dob,
        gender: tempUser.gender,
    }

    if(tempUser?.image){
        userData.image = tempUser.image;
    }
    const newUser = new User(userData);
    await newUser.save();
  
    // Remove temp user from temp users collection
    await TempUser.findByIdAndDelete(tempUser._id);

    if(newUser){
        generateUserToken(res, newUser._id);

        const userData = {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            dob: newUser.dob,
            gender: newUser.gender,
            image: (newUser.image ? newUser.image.url : newUser.googleProfilePicture ? newUser.googleProfilePicture : null),
            isOnline: newUser.isOnline,
            isBlocked: newUser.isBlocked,
        }

        res.status(200).json({ message: "Email verified successfully", userData });
    }else{
        // Handle any errors that occur during the saving of the user
        res.status(500);
        throw new Error("Error saving user");
    }
  
    
  });



//@desc auth user / set token
//route POST /api/v1/users/auth
//@access public
const authUser = asyncHandler(async (req, res) => {

  
    const { email, password } = req.body;

    const user = await User.findOne({ email, isBlocked : false });

    if(!user){
      res.status(400)
      throw new Error('User does not exist or temporarily unavailabale')
    }
    if (user && (await user.matchPassword(password))) {

        // Set isOnline to true
        user.isOnline = true;
        await user.save();

        generateUserToken(res, user._id);

        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            dob: user.dob,
            gender: user.gender,
            image: (user.image ? user.image.url : user.googleProfilePicture ? user.googleProfilePicture : null),
            isOnline: user.isOnline,
            isBlocked: user.isBlocked,
        }

        
        
        res.status(200).json({ message: "Auth verified successfully", userData });
    }else{
      res.status(400)
      throw new Error('User does not exist or temporarily unavailabale')
    }

})

//@desc logout user
//route POST /api/v1/users/logout
//@access private
const logoutUser = asyncHandler(async (req, res) => {
    
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user) {
        user.isOnline = false;
        await user.save();
        
        // Clear the JWT cookie
        res.cookie("user_Jwt", "", {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: "User logged out and is now offline." });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});




//@desc verify email for password reset
//route GET /api/v1/users/forgot-password
//@access public
const forgotPassword = asyncHandler( async(req, res) =>{
 
    const {email} = req.body;

    const user = await User.findOne({ email });

    if(!user){
      res.status(400);
      throw new Error("Not an existing user.");
    }

    const otpToken = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP


    // Set OTP expiration time (3 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // Store or update the OTP details in the OTP collection
    const otpEntry =  await Otp.findOneAndUpdate(
    { email },
    {
      email,
      otp: otpToken,
      otpExpiresAt,
      otpVerified: false, // Reset verification status if resending OTP
      verifiedAt: null, // Reset verification time if resending OTP
    },
    { upsert: true, new: true }
  );


  try {
    // Send the OTP to the user's email
    await sendOtpEmail(email, otpToken);
    res.status(200).json({ success : true, message: 'OTP sent to your email.' });
  } catch (error) {
    // If email sending fails, clean up the OTP entry
    await Otp.deleteOne({ _id: otpEntry._id });
    res.status(500);
    throw new Error('Failed to send OTP email. Please try again.');
  }

})

//@desc verify otp send to email for password reset
//route GET /api/v1/users/verifyOtpForgotPassword
//@access public

const verifyOtpForgotPassword = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

 
  try {
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord || otpRecord.otpExpiresAt < new Date()) {
      res.status(400)
      throw new Error('Invalid or expired OTP')
      
    }

    // Mark OTP as verified
    otpRecord.otpVerified = true;
    otpRecord.verifiedAt = new Date(); // Set the verification time
    await otpRecord.save();

    res.status(200).json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error("Error in verifyOtpForgotPassword:", error);
    res.status(500)
    throw new Error('Failed to verify OTP')
  }
});





const resetForgotPassword = asyncHandler( async (req, res) =>{

    const {email, newPassword : password} = req.body;

    const otpRecord = await Otp.findOne({email});

    if(!otpRecord || !otpRecord.otpVerified || ((otpRecord.verifiedAt.getTime() + 30 * 60 * 1000) < Date.now()) ){
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Find the user and update the password
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.password = password; // Assuming you're storing hashed passwords and 'password' is a setter that hashes the password before storing
    await user.save();

    // Delete the OTP record
    await Otp.deleteOne({email});

    res.status(200).json({ success: true, message: 'Password reset successfully' });


})


    const verifyFirebaseAuth = asyncHandler(async (req, res) => {
        
        const userData = req.user;
    
        if (!userData.email_verified) {
            res.status(401); // Unauthorized
            throw new Error("Not a verified Google account");
        }
    
        const { name, email, picture: googleProfilePicture, sub, user_id, uid } = userData;
    
        try {
            let user = await User.findOne({ email });
    
            if (user) {
                // Update existing user profile
                user.name = name || user.name;
                user.googleId = sub || user_id || uid || user.googleId;
                user.googleProfilePicture = googleProfilePicture || user.googleProfilePicture;
                user.isOnline = true;
    
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    name,
                    email,
                    googleId: sub || user_id || uid,
                    googleProfilePicture,
                    isOnline: true
                });
            }
    
            // Generate user token (if needed)
            await generateUserToken(res, user._id);
    
            res.status(200).json({
                message: "success",
                userData: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    dob: user.dob,
                    gender: user.gender,
                    image: (user.image ? user.image.url : user.googleProfilePicture ? user.googleProfilePicture : null),
                    isOnline: user.isOnline,
                    isBlocked: user.isBlocked,
                }
            });
        } catch (error) {
            // Handle database errors
            res.status(500).json({ message: "Database error", error: error.message });
        }
    });
    

const getAllUsersInfoforAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, searchBy, filterBy = 'default' } = req.query;
  
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;
  
    // Define sorting criteria
    let sortCriteria;
    switch (sortBy) {
      case 'name':
        sortCriteria = { name: 1 }; // Alphabetical order by name
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 }; // Oldest users first by creation date
        break;
      case 'latest':
        sortCriteria = { createdAt: -1 }; // Latest users first by creation date
        break;
      default:
        sortCriteria = { name: 1 }; // Default alphabetical order by name
    }
  
    // Define match criteria for search
    let matchCriteria = {};
    if (searchBy) {
      matchCriteria = {
        name: { $regex: new RegExp(searchBy, 'i') }, // Case insensitive search by name
      };
    }
  
    // Add filter by isBlocked
    if (filterBy === 'blocked') {
      matchCriteria.isBlocked = true;
    }
  
    const users = await User.aggregate([
      {
        $match: matchCriteria,
      },
      {
        $facet: {
          paginatedUsers: [
            { $sort: sortCriteria },
            { $skip: skipNum },
            { $limit: limitNum },
            {
              $lookup: {
                from: 'queries',
                localField: '_id',
                foreignField: 'user',
                as: 'queries',
              },
            },
            {
              $lookup: {
                from: 'perspectives',
                localField: '_id',
                foreignField: 'user',
                as: 'perspectives',
              },
            },
            {
              $lookup: {
                from: 'querycomments',
                localField: '_id',
                foreignField: 'commented_by',
                as: 'queryComments',
              },
            },
            {
              $lookup: {
                from: 'perspectivecomments',
                localField: '_id',
                foreignField: 'commented_by',
                as: 'perspectiveComments',
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                image: 1,
                googleProfilePicture: 1,
                createdAt: 1,
                isBlocked: 1,
                numberOfQueries: { $size: '$queries' },
                numberOfPerspectives: { $size: '$perspectives' },
                numberOfQueryComments: { $size: '$queryComments' },
                numberOfPerspectiveComments: { $size: '$perspectiveComments' },
              },
            },
            {
              $lookup: {
                from: 'blockusers', // Assuming 'blockusers' collection name
                let: { userId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$blocking_user_id', '$$userId'] },
                    },
                  },
                  {
                    $count: 'numberOfusersBlockedByThisUser',
                  },
                ],
                as: 'numberOfusersBlockedByThisUser',
              },
            },
            {
              $lookup: {
                from: 'blockusers', // Assuming 'blockusers' collection name
                let: { userId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ['$blocked_user_id', '$$userId'] },
                    },
                  },
                  {
                    $count: 'numberOfUsersBlockedThisUser',
                  },
                ],
                as: 'numberOfUsersBlockedThisUser',
              },
            },
            {
              $addFields: {
                numberOfusersBlockedByThisUser: { $arrayElemAt: ['$numberOfusersBlockedByThisUser.numberOfusersBlockedByThisUser', 0] },
                numberOfUsersBlockedThisUser: { $arrayElemAt: ['$numberOfUsersBlockedThisUser.numberOfUsersBlockedThisUser', 0] },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          paginatedUsers: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] },
        },
      },
    ]);
  
    
    res.status(200).json({
      success: true,
      users: users[0].paginatedUsers,
      totalCount: users[0].totalCount || 0, // Handle cases where totalCount is undefined
    });
  });
  

const blockUserFromApplication = asyncHandler(async (req, res) => {
            const { userId } = req.body;
          
            
          
            try {
              const user = await User.findById(userId);
          
              if (!user) {
                res.status(404);
                throw new Error('User not found');
              }
          
              if (user.isBlocked) {
                res.status(400);
                throw new Error('User is already blocked');
              }
          
              user.isBlocked = true;
              await user.save();

              // Emit forced_logout event to the user
              req.io.to(`${userId}`).emit('forced_logout');
          
              res.status(200).json({
                success: true,
                message: 'User blocked successfully',
              });
            } catch (error) {
              console.error('Failed to block user:', error);
              res.status(500);
              throw new Error('Failed to block user');
            }
          });
          
const unblockUserFromApplication = asyncHandler(async (req, res) => {
            const { userId } = req.body;
          
            
          
            try {
              const user = await User.findById(userId);
          
              if (!user) {
                res.status(404);
                throw new Error('User not found');
              }
          
              if (!user.isBlocked) {
                res.status(400);
                throw new Error('User is already unblocked');
              }
          
              user.isBlocked = false;
              await user.save();
          
              res.status(200).json({
                success: true,
                message: 'User unblocked successfully',
              });
            } catch (error) {
              console.error('Failed to unblock user:', error);
              res.status(500);
              throw new Error('Failed to unblock user');
            }
          });




const getUserProfileCardInfoForProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Use aggregation pipeline
  const userProfileInfo = await User.aggregate([
    {
      $match: { _id: userId }
    },
    {
      $lookup: {
        from: 'follows',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$followed_user_id', '$$userId'] }, is_accepted: true } },
          { $count: 'followersCount' }
        ],
        as: 'followersInfo'
      }
    },
    {
      $lookup: {
        from: 'follows',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$following_user_id', '$$userId'] }, is_accepted: true } },
          { $count: 'followingCount' }
        ],
        as: 'followingInfo'
      }
    },
    {
      $project: {
        name: 1,
        image: { $ifNull: ['$image.url', '$googleProfilePicture'] },
        followers: { $arrayElemAt: ['$followersInfo.followersCount', 0] },
        following: { $arrayElemAt: ['$followingInfo.followingCount', 0] }
      }
    }
  ]);

  if (!userProfileInfo.length) {
    res.status(404);
    throw new Error('User not found');
  }

  const userInfo = userProfileInfo[0];

  

  res.json({
    name: userInfo.name,
    image: userInfo.image || '',
    followers: userInfo.followers || 0,
    following: userInfo.following || 0,
  });
});

// Handler function to update profile picture
const updateProfilePictureFromProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch the user from the database
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if user has an existing image and remove it from Cloudinary
  if (user.image && user.image.public_id) {
    try {
      await cloudinary.uploader.destroy(user.image.public_id);
    } catch (error) {
      console.error('Error deleting old image from Cloudinary:', error);
    }
  }

  

  // Update user's profile image in the database
  user.image = {
    public_id: req.file.filename,
    url: req.file.path,
  };

  await user.save();

  res.json({
    success:true,
    message: 'Profile image updated successfully',
    image: user.image,
  });
});


// Handler function to update user name
const updateUserNameFromProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const newName = req.body.newName;

  if (!newName || newName.trim().length < 3) {
    res.status(400);
    throw new Error('Name must be at least 3 characters long');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = newName;
  await user.save();

  res.json({
    success: true,
    message: 'Name updated successfully',
    name: user.name,
  });
});

const getUserAboutInfoForProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (user) {
    res.json({
      email: user.email,
      dob: user.dob,
      gender: user.gender,
      nationality: user.nationality,
      phone: user.phone,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const updateUserAboutForProfile = asyncHandler( async (req, res) => {
  const {  dob, gender, nationality, phone } = req.body;

  try {
    const user = await User.findById(req.user._id); // Assuming req.user.id contains the user's ID
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    
    user.dob = new Date(dob);
    user.gender = gender;
    user.nationality = nationality || user.nationality;
    user.phone = phone || user.phone;

    await user.save();

    res.json({ msg: 'Profile updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

const updateUserEmailForProfile = asyncHandler(async (req, res) => {
  const { email, } = req.body;

  try {
    const user = await User.findById(req.user._id); // Assuming req.user.id contains the user's ID

    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    // Check if the email is already in use by another user
    const existingUser = await User.findOne({ email });

    if (existingUser ) {
      res.status(400)
      throw new Error('Email is already in use .')
    }
    
    const otpToken = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    // Set OTP expiration time (3 minutes from now)
    const otpExpiresAt = new Date(Date.now() + 3 * 60 * 1000);

    // Upsert the OTP details in the EmailOtp collection
    await EmailOtp.findOneAndUpdate(
      {
        user_id: user._id,
        old_email: user.email,
        new_email: email
      },
      {
        user_id: user._id,
        old_email: user.email,
        new_email: email,
        otp: otpToken,
        otpExpiresAt
      },
      {
        upsert: true,
        new: true
      }
    );

    // Send the OTP to the new email
    await sendOtpEmail(email, otpToken);

    res.status(200).json({success : true, message: 'OTP sent to your email.', old_email: user.email, new_email: email });
    
  } catch (error) {
    console.error(error.message);
    res.status(500)
    throw new Error('Server error')
  }
});

const verifyUserEmailOtpForProfile = asyncHandler( async (req, res) => {
  const { otp, } = req.body;

  try {
    
    
        // Find the OTP entry for the user
        const emailOtpEntry = await EmailOtp.findOne({
          user_id: req.user._id, // Assuming req.user._id contains the user's ID
          otp,
          otpExpiresAt: { $gte: new Date() } // Check if OTP has not expired
        });
    
        // If OTP entry is not found or is expired
        if (!emailOtpEntry) {
          res.status(400)
          throw new Error('Invalid or expired OTP')
        }
    
        // Update the user's email with the new email address stored in the OTP document
        await User.findByIdAndUpdate(req.user._id, { email: emailOtpEntry.new_email });
    
        // Optionally, remove the OTP entry after successful verification
        await EmailOtp.deleteOne({ _id: emailOtpEntry._id });
    
        res.status(200).json({ success: true, message: 'OTP verified and email updated', new_email: emailOtpEntry.new_email });

    
  } catch (error) {
    console.error(error.message);
    res.status(500)
    throw new Error('Server Error')
  }
});

const getOtherUserProfileData = asyncHandler(async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user._id); // current user's ID
  const requestedUserId = new mongoose.Types.ObjectId(req.query.userId); // requested user's ID

  // Check if the requested user exists
  const requestedUser = await User.findById(requestedUserId);

  if (!requestedUser) {
    console.log(req.query);
    res.status(404);
    throw new Error('Requested user not found');
  }

  // Aggregation pipeline to fetch the required data
  const pipeline = [
    {
      $match: { _id: requestedUserId }
    },
    {
      $lookup: {
        from: 'blockusers',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$blocked_user_id', currentUserId] }, { $eq: ['$blocking_user_id', requestedUserId] } ] } } },
          { $limit: 1 }
        ],
        as: 'isBlockedByRequestedUser'
      }
    },
    {
      $lookup: {
        from: 'blockusers',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$blocked_user_id', requestedUserId] }, { $eq: ['$blocking_user_id', currentUserId] } ] } } },
          { $limit: 1 }
        ],
        as: 'isBlockedByCurrentUser'
      }
    },
    {
      $lookup: {
        from: 'follows',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$followed_user_id', requestedUserId] }, { $eq: ['$following_user_id', currentUserId] }, { $eq: ['$is_accepted', true] } ] } } },
          { $limit: 1 }
        ],
        as: 'currentUserFollowsRequestedUser'
      }
    },
    {
      $lookup: {
        from: 'follows',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$followed_user_id', requestedUserId] }, { $eq: ['$following_user_id', currentUserId] }, { $eq: ['$is_accepted', false] } ] } } },
          { $limit: 1 }
        ],
        as: 'pendingFollowRequestFromCurrentUser'
      }
    },
    {
      $lookup: {
        from: 'follows',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$followed_user_id', requestedUserId] }, { $eq: ['$is_accepted', true] } ] } } },
          { $count: 'followersCount' }
        ],
        as: 'followersCount'
      }
    },
    {
      $lookup: {
        from: 'follows',
        let: { requestedUserId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$following_user_id', requestedUserId] }, { $eq: ['$is_accepted', true] } ] } } },
          { $count: 'followingCount' }
        ],
        as: 'followingCount'
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        googleProfilePicture: 1,
        isBlocked: 1,
        isBlockedByRequestedUser: { $arrayElemAt: ['$isBlockedByRequestedUser', 0] },
        isBlockedByCurrentUser: { $arrayElemAt: ['$isBlockedByCurrentUser', 0] },
        currentUserFollowsRequestedUser: { $arrayElemAt: ['$currentUserFollowsRequestedUser', 0] },
        pendingFollowRequestFromCurrentUser: { $arrayElemAt: ['$pendingFollowRequestFromCurrentUser', 0] },
        followersCount: { $arrayElemAt: ['$followersCount.followersCount', 0] },
        followingCount: { $arrayElemAt: ['$followingCount.followingCount', 0] },
      }
    },
    {
      $addFields: {
        isBlockedByRequestedUser: { $cond: { if: { $gt: ['$isBlockedByRequestedUser', null] }, then: true, else: false } },
        isBlockedByCurrentUser: { $cond: { if: { $gt: ['$isBlockedByCurrentUser', null] }, then: true, else: false } },
        currentUserFollowsRequestedUser: { $cond: { if: { $gt: ['$currentUserFollowsRequestedUser', null] }, then: true, else: false } },
        pendingFollowRequestFromCurrentUser: { $cond: { if: { $gt: ['$pendingFollowRequestFromCurrentUser', null] }, then: true, else: false } }
      }
    }
  ];

  const result = await User.aggregate(pipeline);
  const userProfileData = result[0];

  if (userProfileData.isBlockedByRequestedUser || userProfileData.isBlocked) {
    return res.json({
      isUserUnavailable: true,
      message: 'User data is unavailable at the moment.'
    });
  }

  res.json(userProfileData);
});



const getOtherUserAboutInfoForProfile = asyncHandler(async (req, res) => {
  const currentUserId = new mongoose.Types.ObjectId(req.user._id); // current user's ID
  const requestedUserId = new mongoose.Types.ObjectId(req.query.userId); // requested user's ID

  // Check if the requested user exists
  const requestedUser = await User.findById(requestedUserId).select('-password');

  if (!requestedUser) {
    res.status(404);
    throw new Error('Requested user not found');
  }

  // Check if the current user is blocked by the requested user
  const isBlockedByRequestedUser = await BlockUser.findOne({
    blocking_user_id: requestedUserId,
    blocked_user_id: currentUserId,
  });

  

  // If either blocking relationship exists, respond accordingly
  if (isBlockedByRequestedUser || requestedUser.isBlocked) {
    return res.json({
      isUserUnavailable: true,
      message:'User data is unavailable at the moment.'
    });
  }

  // If no blocking relationship exists, return the requested user's "about" information
  res.json({
    _id: requestedUser._id,
    email: requestedUser.email,
    dob: requestedUser.dob,
    gender: requestedUser.gender,
    nationality: requestedUser.nationality,
    phone: requestedUser.phone,
  });
});

const refreshUserToken = asyncHandler(async (req, res) => {
  const refreshToken = req?.cookies?.user_RefreshJwt;

  

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.USER_REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      
      res.status(404);
      throw new Error('User not found');
    }

    if (user.isBlocked) {
      
      res.status(403);
      throw new Error('User is blocked');
    }

    generateUserToken(res, user._id);

    res.status(200).json({ message: 'Token refreshed successfully', success:true, });
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

const toggleEnableDiscover = asyncHandler(
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { isDiscoverEnabled } = req.body;
  
      // Find the user by ID and update the isDiscoverEnabled field
      const user = await User.findByIdAndUpdate(
        userId,
        { isDiscoverEnabled },
        { new: true, runValidators: true }
      );
  
      if (!user) {
        res.status(404)
        throw new Error('User not found')
      }
  
      res.status(200).json({ success : true, message: 'Discover setting updated successfully', isDiscoverEnabled : user.isDiscoverEnabled });
    } catch (error) {
      res.status(500)
      throw new Error(`Server error : ${error.message}`)
    }
  }
)


const gettoggleEnableDiscoverStatus = asyncHandler( async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user by ID and select the isDiscoverEnabled field
    const user = await User.findById(userId).select('isDiscoverEnabled');

    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    res.status(200).json({ isDiscoverEnabled: user.isDiscoverEnabled });
  } catch (error) {
    res.status(500)
    throw new Error(`Server error : ${error.message }`)
  }
}

)

const discoverSimilarTopicFollowings = asyncHandler( asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit =  10;

  try {
    const similarUsers = await TopicFollow.aggregate([
      // Match users who follow the same topics as the current user
      {
        $match: {
          user_id: { $ne: new mongoose.Types.ObjectId(userId) }, // Exclude current user
          topic_id: { $in: await TopicFollow.find({ user_id: userId }).distinct('topic_id') } // Match topics followed by the current user
        }
      },
      // Group by user and count the number of common topics
      { $group: { _id: '$user_id', commonTopics: { $sum: 1 } } },
      // Sort by the number of common topics in descending order
      { $sort: { commonTopics: -1 } },
      // Limit the results
      { $limit: limit },
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      // Project the required fields
      {
        $project: {
          _id: 0,
          user: {
            _id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            image: '$userDetails.image',
            googleProfilePictures : '$userDetails.googleProfilePicture',
            commonTopics: '$commonTopics'
          }
        }
      }
    ]);

    res.status(200).json({success : true, similarUsers});
  } catch (error) {
    res.status(500)
    throw new Error(`Server error : ${error.message}`)
  }
}))




  module.exports =  {

    registerUser,
    verifyEmailOtp,
    resendEmailOtp,
    authUser,
    logoutUser,
    forgotPassword,
    verifyOtpForgotPassword,
    resetForgotPassword,
    verifyFirebaseAuth,
    getAllUsersInfoforAdmin,
    blockUserFromApplication,
    unblockUserFromApplication,
    getUserProfileCardInfoForProfile,
    updateProfilePictureFromProfile,
    updateUserNameFromProfile,
    getUserAboutInfoForProfile,
    updateUserAboutForProfile,
    getOtherUserProfileData,
    getOtherUserAboutInfoForProfile,
    refreshUserToken,
    toggleEnableDiscover,
    gettoggleEnableDiscoverStatus,
    discoverSimilarTopicFollowings,
    updateUserEmailForProfile,
    verifyUserEmailOtpForProfile

  }

