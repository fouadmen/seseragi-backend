const mongoose = require('mongoose');
const UsersService = require('../../src/services/UsersService');
const connectionString = 'mongodb://localhost:27017/SeseragiDB';

const validUserData = {
    "userId": "test@gmail.com",
    "name" : "Fouad",
    "password": "123654987435",
    "role": "user"
};

const invalidUserData = {
    "name" : "Fouad",
    "password": "123654987435",
    "role": "user"
};

const validUserId = "test@gmail.com";

const invalidUserId= "notest@gmail.com";

const dataToModify = { "devices" : ["B4:E6:2D:99:7B:94", "B4:E6:2D:99:7B:74"] }

describe('User Sign In test', function () {
    beforeAll(async ()=>{
        await mongoose.connect(connectionString,{useNewUrlParser: true, useUnifiedTopology:true},(err)=>{
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    it("Create and save valid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.signIn(validUserData)).toBe(true);
    });

    it("Create and save invalid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.signIn(invalidUserData)).toBe(false);
    });

    it("Modify a valid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.editUser(validUserId, dataToModify)).toBe(true);
    });

    it("Modify an invalid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.editUser(invalidUserId, dataToModify)).toBe(false);
    });

    it("Delete a valid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.deleteUser(validUserId)).toBe(true);
    });

    it("Delete an invalid user",async ()=>{
        expect.assertions(1);
        expect(await UsersService.deleteUser(invalidUserId)).toBe(false);
    });

});
