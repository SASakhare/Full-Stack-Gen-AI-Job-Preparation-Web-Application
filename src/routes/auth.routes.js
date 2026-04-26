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






module.exports=authRouter



