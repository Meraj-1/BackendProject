import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"




const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accesToken, refreshToken };
   
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  //validation -not empty
  //check if user already exists :email
  // check for images, check for avatar
  // upload them to cloudnary,avtar
  // create user object - create entry in db
  // remmove passsword and refresh token field from username
  // check for user creation
  // return res
  const { fullName, email, username, password } = req.body;
  //    console.log("email", email);
  if (
    [fullName, email, username, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // let coverImageLocalPath;
  // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
  //   coverImageLocalPath = req.files.coverImage[0];
  // }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Some thing went wrong while registerd");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find user
  //password check
  //access and refreshtoken
  //send cookie

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  } else {
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

 
 
  const { accesToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );


  const loggedInUser = await User.findById(user._id)
  .select("-password -refreshToken");

  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accesToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accesToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out Successfully"));
});

const refreshAccesToken = asyncHandler(async (req, res) => {
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
 if (!incomingRefreshToken) {
   throw new ApiError(401, "Unauthorized request");
  
  try {
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id) 
  
   if (!user) {
     throw new ApiError(401, "Invalid Refresh Token");
    }
   if(incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401, "Invalid Refresh Token");
   }
   const option = {
    httpOnly: true,
    secure: true,
   }
  const {accesToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id)
   return res
   .status(200)
   .cookie("accessToken", accesToken, option)
   .cookie("refreshToken", refreshToken, option) 
   .json(new ApiResponse(200, {accesToken, newrefreshToken}, "User refreshed Access Token Successfully"))
  }
   catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
   }}
})

export {
 registerUser,
 loginUser,
 logoutUser,
 refreshAccesToken
};
