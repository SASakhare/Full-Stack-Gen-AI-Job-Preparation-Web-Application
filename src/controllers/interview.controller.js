const { PDFParse } = require("pdf-parse")

const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {


    const resumeContent = await (new PDFParse({ data: req.file.buffer })).getText();

    const { selfDescription, jobDescription } = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
        message: "Interview Report Generated Successfully",
        interviewReport
    })

}


async function getInterViewReportByIdController(req, res) {
    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}



async function getAllInterViewReportController(req, res) {

    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    if (!interviewReports) {
        return res.status(404).json({
            message: "Interviews reports not found"
        })
    }

    res.status(200).json({
        message: "Interviews reports fetched successfully.",
        interviewReports
    })
}




module.exports = {
    generateInterViewReportController,
    getInterViewReportByIdController,
    getAllInterViewReportController,
}