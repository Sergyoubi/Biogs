const { check } = require('express-validator');

const educationInputChecks = [
    check('primaryschool', 'Invalid input for Primary school.').isLength({min: 3, max: 40}).matches(/^[A-Za-z\s]+$/).withMessage('Primary school must be alphabetic.'),
    check('middleschool', 'Invalid input for High School.').isLength({min: 3, max: 40}).matches(/^[A-Za-z\s]+$/).withMessage('Middle school must be alphabetic.'),
    check('university', 'Invalid input for University.').isLength({min: 3, max: 30}).matches(/^[A-Za-z\s]+$/).withMessage('University must be alphabetic.'),
    check('department', 'Invalid University Department.').isLength({min: 3, max: 30}).matches(/^[A-Za-z\s]+$/).withMessage('Department must be alphabetic.'),
    check('degree', 'Invalid Degree').isLength({min: 3, max: 30}).matches(/^[A-Za-z\s]+$/).withMessage('Degree must be alphabetic.')
];

const experienceInputChecks = [
    check('job1position', 'Invalid input for First Job.').isLength({min: 3, max: 40}).matches(/^[A-Za-z\s]+$/),
    check('company1', 'Company 1 value is invalid.').isLength({min: 4, max: 30}).matches(/^[A-Za-z\s]+$/),
    check('job1duration', 'Invalid duration for fisrt Job.').isInt(),
    check('job1description', 'First Job description is invalid.').isLength({min: 10, max: 100}).matches(/^[A-Za-z\s]+$/),
    
    check('job2position', 'Invalid input for Second Job.').isLength({min: 4, max: 40}).matches(/^[A-Za-z\s]+$/), 
    check('company2', 'Company 2 value is invalid.').isLength({min: 4, max: 30}).matches(/^[A-Za-z\s]+$/),
    check('job2duration', 'Invalid duration for second Job').isInt(),
    check('job2description', 'Second Job description is invalid').isLength({min: 10, max: 100}).matches(/^[A-Za-z\s]+$/),

    check('job3position', 'Invalid input for third Job.').isLength({min: 4, max: 40}).matches(/^[A-Za-z\s]+$/), 
    check('company3', 'Company 3 value is invalid.').isLength({min: 4, max: 30}).matches(/^[A-Za-z\s]+$/),
    check('job3duration', 'Invalid duration for third Job').isInt(),
    check('job3description', 'Third Job description is invalid').isLength({min: 10, max: 100}).matches(/^[A-Za-z\s]+$/)
    
];

module.exports.education =  educationInputChecks;
module.exports.experience =  experienceInputChecks;
    
    




