
CREATE DATABASE biogs;


CREATE TABLE users (
    user_id SERIAL NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
); 


CREATE TABLE profile (
    profile_id SERIAL NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    profilepic VARCHAR(255) NOT NULL,
    userjob VARCHAR(255) NOT NULL,
    userindustry VARCHAR(255) NOT NULL,
    usercountry VARCHAR(255) NOT NULL,
    usercity VARCHAR(255) NOT NULL 
); 


CREATE TABLE education (
    educ_id SERIAL NOT NULL PRIMARY KEY,
    primaryschool VARCHAR(255) NOT NULL,
    middleschool VARCHAR(255) NOT NULL,
    university VARCHAR(255) DEFAULT'',
    universitydepartment VARCHAR(255) DEFAULT'',
    degree VARCHAR(255) DEFAULT''
); 


CREATE TABLE experience (
    exp_id SERIAL NOT NULL PRIMARY KEY,

    firstjobposition VARCHAR(255) NOT NULL,
    firstjobcompany VARCHAR(255) NOT NULL,                     
    firstjobduration VARCHAR(255) NOT NULL,
    firstjobdurationtype VARCHAR(255) NOT NULL,
    firstjobdescription TEXT NOT NULL,

    secondjobposition VARCHAR(255) NOT NULL,
    secondjobcompany VARCHAR(255) NOT NULL,
    secondjobduration VARCHAR(255) NOT NULL,
    secondjobdurationtype VARCHAR(255) NOT NULL,
    secondjobdescription  TEXT NOT NULL,

    thirdjobposition VARCHAR(255) NOT NULL,
    thirdjobcompany VARCHAR(255) NOT NULL,
    thirdjobduration VARCHAR(255) NOT NULL,
    thirdjobdurationtype VARCHAR(255) NOT NULL,
    thirdjobdescription TEXT NOT NULL
);

