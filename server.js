const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash')
const pool = require('./dbconfig')
const cors = require('cors')
const passport = require('passport')
const initializePassport = require('./passportConfig');
const path = require('path')
const multer = require("multer");
const {validationResult } = require('express-validator');
const checkInputs = require('./inputValidation');

const port = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use(session( {
    secret: "mysecretcookies",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, //JS on client side couldn't access it.
        maxAge: 24 * 60 * 60  * 1000, //24hours
        sameSite: true // the browser will only accept the cookie if it's coming from the same origin
    }
    })
);

initializePassport(passport)
app.use ( passport.initialize() );
app.use ( passport.session() );
app.use(flash());
app.listen(port, () => {console.log("Server running on Port 4000")});


const storage = multer.diskStorage({
    destination: './public/profiles',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  // 1st param: null = we don'want any errors to be shown, 2nd: original file_name + date + original file extension
    }
});

const imageUpload = multer({
    storage: storage, 
    limits: {fileSize: 10000000}, 
    fileFilter: (req, file, cb)=>{
        checkFileType(file, cb);
    }
}).single('profilepic');


app.get("/", (req,res) =>{
    res.render("desktop")
});


app.get("/signup", (req, res) => {
    res.render("signup")
});


app.get("/login", (req, res) => {
    res.render("login")
});


app.get("/profile", checkNotAuthenticated, (req, res) => {
    res.render("profile")
});


app.get("/education", checkNotAuthenticated, (req, res) => { 
    res.render("education")
});


app.get("/experience", checkNotAuthenticated, (req, res) => {
    res.render("experience")
});


app.get("/dashboard/:id", checkNotAuthenticated, (req,res) => {    
    try{       
        const { id } = req.params;       
        const sqlQuery = "SELECT * FROM users, profile  WHERE users.user_id = $1 AND profile.profile_id = $2";
        const getUserInfo = pool.query(sqlQuery, [id, id], (err, result) => {
            if (err) { 
                console.log(`Something went wrong :${err.message}`)
            } else {                
                res.render("dashboard", { model: result.rows[0], userId: req.user.user_id })                  
            }
        }); 
    }catch(err){
        console.log(err.message)
    }
});


app.get("/biography/:id", checkNotAuthenticated, (req,res) => { 
    try{       
        const { id } = req.params;
        const sqlQuery =  "SELECT * FROM users, profile, education, experience WHERE users.user_id = $1 AND profile.profile_id = $2 AND education.educ_id = $3 AND experience.exp_id = $4";       
        const getUserInfos = pool.query(sqlQuery, [id, id, id, id], (err, result) => {
            if (err) {
                console.log(`Something went wrong :${err.message}`)
            } else {               
                res.render("biography", { model: result.rows[0], userId: req.user.user_id })
            }
        });
    }catch (err) {
        console.log(err.message)
    }
});


app.get("/edit/profile/:id",  checkNotAuthenticated, (req, res) => {
    try{       
        const { id } = req.params;      
        const sqlQuery = "SELECT * FROM users, profile WHERE users.user_id = $1 AND  profile.profile_id = $2";
        const getUserProfile = pool.query(sqlQuery, [id, id], (err, result) => {
            if (err) {
                console.log(`Error while querying profile data :${err.message}`)
            } else {               
                res.render("editprofile", { model: result.rows[0], userId: req.user.user_id })
            }
        });
    }catch(err) {
        console.log(err.message)
    } 
})


app.get("/edit/education/:id",  checkNotAuthenticated, (req, res) => {
    try{      
        const { id } = req.params;
        const sqlQuery = "SELECT * FROM users, education, profile WHERE users.user_id = $1 AND education.educ_id = $2 AND profile.profile_id = $3";
        const getUserEducation = pool.query(sqlQuery, [id, id, id], (err, result) => {
            if (err) {
                console.log(`Error while querying education data :${err.message}`)
            } else {                
                res.render("editeducation", { model: result.rows[0], userId: req.user.user_id })
            }
        });             
    }catch(err) {
        console.log(err.message)
    }
});

app.get("/edit/experience/:id",  checkNotAuthenticated, (req, res) => {   
    try{       
        const { id } = req.params;
        const sqlQuery = "SELECT * FROM users, experience, profile WHERE users.user_id = $1 AND experience.exp_id = $2 AND profile.profile_id = $3";
        const getUserExp = pool.query(sqlQuery, [id, id, id], (err, result) => {
            if (err) {
                console.log(`Error while querying user experience :${err.message}`)
            } else {
                res.render("editexperience", { model: result.rows[0], userId: req.user.user_id })
            }
        });
    }catch(err) {
        console.log(err.message)
    }
});


app.get("/edit/profile/picture/:id", checkNotAuthenticated, (req, res) => {
    try{       
        const { id } = req.params;
        const sqlQuery = "SELECT * FROM users, profile WHERE users.user_id = $1  AND profile.profile_id = $2";
        const getUserExp = pool.query(sqlQuery, [id, id], (err, result) => {
            if (err) {
                console.log(`Error while querying user profile picture :${err.message}`)
            } else {
                res.render("editprofilepics", { model: result.rows[0], userId: req.user.user_id })
            }
        });
    }catch(err) {
        console.log(err.message)
    }    
});

app.get("/logout", (req, res)=>{
    req.logOut()
    res.redirect("/")
});

//404 page
app.get('/*', (req, res) => {
    res.status(404).render("404", {title: "Error 404"});
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {

        const errors = [];

        if (err) { 
            return next(err)
        }
        if (!user) { 
            errors.push({ message: "Incorrect Email or Password" })      
        }
        if (errors.length > 0) {
            return res.render('login', { errors })
        }
        req.logIn(user, (err) => {  //user == req.user
            if (err) { 
                return next(err) 
            }     
            const sqlQuery = "SELECT (profile_id) FROM profile WHERE profile_id = $1";

            const compareUserId = pool.query(sqlQuery, [user.user_id], (err, result) => {
                if(err) {
                    console.log(err.message)
                }
                if (user.user_id == result.rows[0].profile_id) {    
                    console.log("User already has Profile")
                    res.redirect('/dashboard/' + user.user_id)
                }
                if (user.user_id > result.rows[0].profile_id) {
                    console.log("User doesn't have Profile yet")   
                    res.render('profile')
                }
            });     
        });
    })(req, res, next);   
});                                               
 
                                                

app.post("/signup", async (req,res) => {
    const {email, password, password2} = req.body
    const errors = [];

    if (!email  || !password){
        errors.push({message:"Please enter all fields"})
    }
    if (password != password2){
        errors.push({message:"Password do not match"})
    }
    if (password.length < 7){  //bring back password into 10 but this is for try purposes
        errors.push({message:"Password should be at least 7 characters"})
    }
    if (errors.length > 0) { // more than 0 means there had been an error
        res.render("signup", {errors})
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sqlQuery = 'SELECT * FROM users  WHERE email = $1';
        const ckeckUsers = pool.query(sqlQuery, [email], (err, results) => {
            if (err) {
                throw err
            }
            if (results.rows.length > 0) {
                errors.push({message: 'Email already registered'});
                res.render("signup", {errors});
            } else {
                const sqlQuery = 'INSERT INTO users  (email, password) VALUES ($1, $2) RETURNING *';
                const registerUser = pool.query(sqlQuery, [email, hashedPassword], (err,results) => {
                    if (err) {
                      console.log(err.message)
                    }         
                    req.flash("success_msg", "You are successfully registered.")                 
                    res.redirect("/login")         
                });
            }
        });
    }
});


//Add new user Profile
app.post("/profile", (req, res) => {       
    imageUpload(req, res, (err) => { //multer error
        if (err) {
            res.render('profile',{errorMessage: err});     
        }
        const errorMessage = []; 
        const [userName, userPic, userJobs, userIndustry, userCountry, userCity] = [req.body.fullname, req.file.filename, req.body.currentjob, req.body.industry, req.body.country, req.body.city]

        if(userName.length < 3) { //validating username
            errorMessage.push({message: "Username must be at least 3 chars long"})
        }
        if(userName.length > 20) {
            errorMessage.push({message: "Username to long"})
        }
        if(userJobs.length < 3){  //validating user's Job
            errorMessage.push({message: "Invalid value for current Job"})
        }
        if(userJobs.length > 20){
            errorMessage.push({message: "Invalid value for current Job"})
        }       
        if(userCity.length < 3){ //validating City name
            errorMessage.push({message: "Invalid city name"})
        }
        if(userCity.length > 20){
            errorMessage.push({message: "City name too long"})
        }
        if(errorMessage.length > 0) {
            res.render("profile", {errorMessage})

        }else{
            try{
                const sqlInsertQuery = "INSERT INTO profile (username, profilepic, userjob, userindustry,  usercountry,  usercity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
                const insertNewProfile = pool.query(sqlInsertQuery, [userName, userPic, userJobs, userIndustry, userCountry, userCity], (err, result) => {
                    if (err) {
                        console.log(`Something went wrong :${err.message}`)
                    } else {
                        res.render("education") 
                    };
                })
            }catch(err){
                console.lor(err.message)
            }         
        }
    });
});

app.post("/education", checkInputs.education, (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array();
        res.redirect("/education", { errorMessage })   
    }else{
        try{
            const [primarySchool, middleSchool, university, department, degree] = [req.body.primaryschool, req.body.middleschool, req.body.university, req.body.department, req.body.degree];
            const userEducationData = [primarySchool, middleSchool, university,  department, degree];       
            const sqlQuery = "INSERT INTO education ( primaryschool, middleschool, university, universitydepartment, degree) VALUES ($1, $2, $3, $4, $5) RETURNING *";        
            const insertEducation =  pool.query(sqlQuery, userEducationData, (err, result) => {
                if (err) {
                    console.log(`Something went wrong :${err.message}`)
                } else {
                    res.render("experience")
                };
            });    
        }catch (err) {
            console.log(err.message)
        }
    }
});


app.post("/experience", checkInputs.experience, (req, res) => {     
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {
        const errorMessage = errors.array();
        res.render("experience", { errorMessage })           
    }else{
        try{ //constants To destructure 
            const [firstJob, firstCompany, firstJobDuration, firstJobDurationType, firstJobDescription] = [req.body.job1position, req.body.company1, req.body.job1duration, req.body.durationtype[0], req.body.job1description];
            const [secondJob, secondCompany, secondJobDuration, secondJobDurationType, secondJobDescription] = [req.body.job2position, req.body.company2, req.body.job2duration, req.body.durationtype[1], req.body.job2description];
            const [thirdJob, thirdCompany, thirdJobDuration, thirdJobDurationType, thirdJobDescription] = [req.body.job3position, req.body.company3, req.body.job3duration, req.body.durationtype[2], req.body.job3description];

            const userId = req.user.user_id;
            const sqlQuery = "INSERT INTO experience ( firstjobposition,  firstjobcompany, firstjobduration, firstjobdurationtype, firstjobdescription, secondjobposition, secondjobcompany, secondjobduration, secondjobdurationtype, secondjobdescription, thirdjobposition, thirdjobcompany, thirdjobduration, thirdjobdurationtype, thirdjobdescription) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *";
            const userExperienceData = [firstJob, firstCompany, firstJobDuration, firstJobDurationType, firstJobDescription, secondJob, secondCompany, secondJobDuration, secondJobDurationType, secondJobDescription, thirdJob, thirdCompany, thirdJobDuration, thirdJobDurationType, thirdJobDescription];           
            const insertExperience =  pool.query(sqlQuery, userExperienceData, (err, result) => {
                if (err) {
                    console.log(`Something went wrong :${err.message}`)
                } else {
                    res.redirect("/dashboard/" + userId) 
                };
            });

        }catch(err) {
            console.log(err.message)
        }
    }     
});


//Edit user profile
app.post("/edit/profile/:id", (req, res) => {
    try{

        const {id} = req.params;      
        const sqlUpdateQuery = "UPDATE profile SET username = $1, userjob = $2, userindustry = $3, usercountry = $4, usercity = $5 WHERE profile_id = $6";
        const { fullname, currentjob, industry, country, city } = req.body;
          
        const updateProfile = pool.query(sqlUpdateQuery, [fullname, currentjob, industry, country, city, id], (err, result) => {
            if (err) {
                console.log(`Error while updating user profile :${err.message}`)
            } else {
                res.redirect(`/edit/education/${req.user.user_id}`)  
            };
        })
    }catch(err){
        console.log(err.message)
    }            
});


//Edit User Education data
app.post("/edit/education/:id", (req, res) => {  
    try{
        const {id} = req.params;  //constants To destructure       
        const [primarySchool, middleSchool, university, department, degree] = [req.body.newprimaryschool, req.body.newmiddleschool, req.body.newuniversity, req.body.newdepartment, req.body.newdegree];          
        const sqlUpdateQuery = "UPDATE education SET primaryschool = $1, middleschool = $2, university = $3, universitydepartment = $4, degree = $5 WHERE educ_id = $6";
          
        const updateEducationData =  pool.query(sqlUpdateQuery, [primarySchool, middleSchool, university, department, degree, id], (err, result) => {
            if (err) {
                console.log(`Error while updating user education :${err.message}`)
            } else {
                res.redirect(`/edit/experience/${req.user.user_id}`)
            };
        });         
    }catch (err) {
        console.log(err.message)
    }
});


//update User Exp
app.post("/edit/experience/:id", (req, res) => {     
    try{
        const {id} = req.params;  //constants To destructure 
        const [firstJob, firstCompany, firstJobDuration, firstJobDurationType, firstJobDescription] = [req.body.newjob1position, req.body.newcompany1, req.body.newjob1duration, req.body.durationtype[0], req.body.newjob1description];
        const [secondJob, secondCompany, secondJobDuration, secondJobDurationType, secondJobDescription] = [req.body.newjob2position, req.body.newcompany2, req.body.newjob2duration, req.body.durationtype[1], req.body.newjob2description];
        const [thirdJob, thirdCompany, thirdJobDuration, thirdJobDurationType, thirdJobDescription] = [req.body.newjob3position, req.body.newcompany3, req.body.newjob3duration, req.body.durationtype[2], req.body.newjob3description];
        const sqlUpdateQuery = "UPDATE experience SET firstjobposition = $1,  firstjobcompany = $2, firstjobduration = $3, firstjobdurationtype = $4, firstjobdescription = $5, secondjobposition = $6, secondjobcompany = $7, secondjobduration = $8, secondjobdurationtype = $9, secondjobdescription = $10, thirdjobposition = $11, thirdjobcompany = $12, thirdjobduration = $13, thirdjobdurationtype = $14, thirdjobdescription = $15 WHERE exp_id = $16";
        const updateExperienceData = [firstJob, firstCompany, firstJobDuration, firstJobDurationType, firstJobDescription, secondJob, secondCompany, secondJobDuration, secondJobDurationType, secondJobDescription, thirdJob, thirdCompany, thirdJobDuration, thirdJobDurationType, thirdJobDescription, id];
            
        const insertExperience =  pool.query(sqlUpdateQuery, updateExperienceData, (err, result) => {
            if (err) {
                console.log(`Error while updating user experience :${err.message}`)
            } else {            
                res.redirect(`/dashboard/${req.user.user_id}`) 
            }
        });
    }catch(err) {
        console.log(err.message)
    }
})  


//update profile pic
app.post("/edit/profile/picture/:id", (req, res) => {
    imageUpload(req, res, (err) => {
        if (err) {
            res.render('editprofilepics',{errorMessage: err});
            //res.redirect(`/edit/profile/picture/${req.user.user_id}`, {errorMessage: err}) 
        }
        try{
            const {id} = req.params;
            const newPics = req.file.filename     
            const sqlUpdateQuery = "UPDATE profile SET profilepic = $1 WHERE profile_id = $2";
            const updateProfilePic = pool.query(sqlUpdateQuery, [newPics, id], (err, result) => {
                if (err) {
                    console.log(`Error while updating profile picture:${err.message}`)
                } else {                   
                    res.redirect(`/dashboard/${req.user.user_id}`) 
                }
            })
        }catch(err){
            console.log(err.message)
        }
    })
});

function checkNotAuthenticated (req, res, next) {
    if ( req.isAuthenticated() ){
      return next()
    }
    res.redirect("/login");
}

function checkFileType(file, cb) {
    //alowed extension
    const fileTypes = /jpeg|jpg|png|gif/;
    //check extension
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    //check mime
    const mimeType = fileTypes.test(file.mimetype)
    if (extName & mimeType){
        return cb (null, true);
    } else {
        cb ("Please upload an Image");
    }
};

// ==> can't load resources (images, js file) in certain pages bacause(JS codes are holds in a file) of added req.params in url
//check if req.user.user_id can replace req.params.id
