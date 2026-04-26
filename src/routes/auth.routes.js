const {Router}=require('express')

const authRouter=Router()

const authController=require('../controllers/auth.controller')

/**
 * @route POST /api/auth/register
 * @description Register a new User
 * @access Public
 */
authRouter.post('/register',authController.registerUserController)




/**
 * @route POST /api/auth/login
 * @description Logging user with email and password
 * @access Public
 */
authRouter.post('/login',authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
authRouter.post('/logout',authController.logoutUserController)






module.exports=authRouter



