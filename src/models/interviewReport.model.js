const mongoose = require('mongoose')
const { required } = require('zod/mini')

/*
* - job description schema : String
* - resume text : String
* - Self description

* - matchScore : Number
*
*
* - Technical question : [{ question:"" ,intention:"",answer:""}]
* - Behavioral question : [{ question:"" ,intention:"",answer:""}]
* - Skill gaps : [{
*               skill:"",
*               severity:{
*                   type:String,
*                   enum:["low","medium","high"]
*                   }
*               }]
* - preparation plan:[{
*       day : Number,
*       focus : String,
*        task : [String]
*
*   }]
*/

const technicalQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required."]
    },
    intention: {
        type: String,
        required: [true, "Intention is required."]
    },
    answer: {
        type: String,
        required: [true, "Answer is required."]
    },
}, {
    _id: false,
})

const behavioralQuestionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Behavioral question is required."]
    },
    intention: {
        type: String,
        required: [true, "Intention is required."]
    },
    answer: {
        type: String,
        required: [true, "Answer is required."]
    },
}, {
    _id: false,
})



const skillGapsSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required."]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity is required."]
    }
}, {
    _id: false,
})


const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required."]
    },
    focus: {
        type: String,
        required: [true, "Focus is required."]
    },
    tasks: [{
        type: String,
        required: [true, "Task is required."]
    }]
}, {
    _id: false,
})





const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true,],
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },

    technicalQuestions: [technicalQuestionsSchema],
    behavioralQuestions: [behavioralQuestionsSchema],
    skillGaps: [skillGapsSchema],
    preparationPlan: [preparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: [true, "Job title is required"]
    }
}, {
    timestamps: true,
})



const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema);

module.exports = interviewReportModel



























