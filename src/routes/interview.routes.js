const express = require("express")
const authMiddleware = require("../middlewares/auth.middlewares")
const interviewController = require("../controllers/interview.controller")
const interviewRouter = express.Router()
const upload = require("../middlewares/file.middlewares")


/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description , resume pdf and job description.
 * @access private
 */

interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)


/**
 * @route GET /api/interview/report/:interviewId
 * @description generate new interview report by interviewId
 * @access private
 */

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterViewReportByIdController)


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user
 * @access private
 */

interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterViewReportController)




/**
 * @route GET /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */

interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePDFController)








module.exports = interviewRouter












































