const express=require("express")
const authMiddleware=require("../middlewares/auth.middlewares")
const interviewController=require("../controllers/interview.controller")
const interviewRouter=express.Router()
const upload = require("../middlewares/file.middlewares")


/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description , resume pdf and job description.
 * @access private
 */

interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterViewReportController)








module.exports = interviewRouter












































