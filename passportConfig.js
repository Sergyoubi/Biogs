const localStrategy = require("passport-local").Strategy;

const pool = require("./dbConfig");

const bcrypt = require("bcrypt");

function initialize (passport) {

    const authenticateUser = (email, password, done) => {

        const sqlQuery = 'SELECT * FROM users WHERE email = $1';

        pool.query(sqlQuery, [email], (err, results) => {

            if (err) {
                throw err
            }

            if (results.rows.length > 0) {

                const user = results.rows[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {

                    if (err) {
                        console.log(err.message)
                    }
                    if (isMatch) {
                        return done (null, user)
                    } else {
                        return done (null, false) 
                    }
                });
            } else {
                return done (null, false)  
            }
        })
    }

    passport.use( 
        new localStrategy ({ usernameField: "email", passwordField: "password"}, authenticateUser)
    );

    passport.serializeUser((user,done) => done(null, user.user_id));

    passport.deserializeUser((user_id, done) => {
        const sqlQuery = "SELECT * FROM users  WHERE user_id = $1";
        pool.query(sqlQuery, [user_id], (err, results) => {
            if (err) {
                console.log(err.message)
            }           
            return done (null, results.rows[0]);
        });
    });
};

module.exports  = initialize
  

