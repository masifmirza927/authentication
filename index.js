const express = require("express");
const app = express();
const mongoose = require('mongoose');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require("fs");
const ProductModel = require("./models/ProductModel");
const UserModel = require("./models/UserModel");
const OrderModel = require("./models/OrderModel");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const privateKey = "khkhj&^5234234((*23423";
const authCheck = require("./middlewares/authCheck");
const cors = require("cors");


// validators
const validator  = require('express-validator');

app.use(express.json());
app.use(cors());

app.post("/uploads", upload.array('images'), async (request, response) => {


    request.files.forEach((image, index) => {
        uploadImages(request, image, index);
    });

    try {
        await ProductModel.create(request.body);
        response.json({
            status: true
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return response.json({
                status: false,
                errors: errors
            })
        }
    }

});

// create user
app.post("/signup",upload.single('image'), async (request, response) => {

    // if(!validator.isEmail(request.body.email)) {
    //     return response.json({
    //         status: false,
    //         message: "email is not correct"
    //     })
    // }

    

    // upload file
    uploadImageSingle(request, request.file);

    try {
        // check already registerd or not
        const userExist = await UserModel.find({ email: request.body.email });
        if (userExist.length > 0) {
            response.json({
                status: false,
                message: "This email is already registered"
            })
        }
        // generate hashed password
        request.body.password = await bcrypt.hash(request.body.password, 10);

        // sanitizing
        await UserModel.create(request.body);
        response.json({
            status: true
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return response.json({
                status: false,
                errors: errors
            })
        }
    }

});

app.post("/profile", authCheck, async (request, response) => {

   console.log(request.data.id);
    const userId = new mongoose.Types.ObjectId(request.data.id);

    try {
        const orders = await OrderModel.find({ user: userId})
        .populate("product")
        .populate("user")
        .exec();

        return response.json({
            status: true,
            orders: orders
        })
    } catch (error) {
        console.log(error);
    }


  
})

app.post("/login", async (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    //STEP 1  user is reqistered or not
    let user = await UserModel.findOne({ email: email });
    if (!user) {
        return response.json({
            status: false,
            message: "This email is not registered"
        })
    }

     //STEP 2 now we got the user, now check password is correct
    try {
        const isPassOk = await bcrypt.compare(password, user.password);
        if(isPassOk == true) {
            const token = jwt.sign({name: user.name, id:user._id, role: user.role }, privateKey);
            return response.json({
                status: true,
                token: token
            })
        }else {
            return response.json({
                status: false,
                message: "username or password is incorrect"
            })
        }


    } catch (error) {
        
    }

})

app.post("/product-create", upload.array('images'), async (request, response) => {

    // upload file
    request.files.forEach((image, index) => {
        uploadImages(request, image, index);
    });

    try {
        await ProductModel.create(request.body);
        response.json({
            status: true
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};

            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return response.json({
                status: false,
                errors: errors
            })
        }
    }

});

app.post("/order-create", async (request, response) => {

    try {
        await OrderModel.create(request.body);
        response.json({
            status: true
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            let errors = {};
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });

            return response.json({
                status: false,
                errors: errors
            })
        }
    }

});

app.get("/ordersbyuser/:id", async (request, response) => {

    const userId = request.params.id;
    try {
        const orders = await OrderModel.find({user: new mongoose.Types.ObjectId(userId) })
        .populate("product")
        .populate("user")
        .exec();

        return response.json({
            status: true,
            orders: orders
        });

    } catch (error) {
        return response.json({
            status: false,
        })
    }

});

app.get("/orders", async (request, response) => {


    try {
        const orders = await OrderModel.find({});
        return response.json({
            status: true,
            orders: orders
        });

    } catch (error) {
        return response.json({
            status: false,
        })
    }

});


app.get("/search", async (request, response) => {
   
    const search = request.query.q;
    const price = request.query.price;

    let QueryObject = {
        title: {$regex: search, $options: 'i'}
    };

    if(price !== "0") {
        const minPrice = Number(price?.split("-")[0]);
        const maxPrice =  Number(price?.split("-")[1]);
    
        
        // check if price is greater than only
        if(maxPrice === 0) {
            QueryObject["price"] = {$gte : minPrice};
        } else if(!isNaN(minPrice) && !isNaN(maxPrice)){
            QueryObject["price"] = {$gte : minPrice, $lte : maxPrice};
        }
    }

    
    console.log(QueryObject);

    try {
        const products = await ProductModel.find(QueryObject);
        return response.json({
            status: true,
            products: products
        });

    } catch (error) {
        return response.json({
            status: false,
            error: error.message
        })
    }

});


// multiple
function uploadImages(request, image, ind) {
    if (image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/jpeg") {
        let ext = image.mimetype.split("/")[1];
        const NewImgName = image.path + "." + ext;
        request.body['image' + ind] = NewImgName;
        fs.rename(image.path, NewImgName, () => { console.log("uploaded") });
    } else {
        fs.unlink(image.path, () => { console.log("deleted") })
        return response.json({
            status: "not allowed"
        })
    }
}

// single image
function uploadImageSingle(request, image) {
    if (image.mimetype == "image/png" || image.mimetype == "image/jpg" || image.mimetype == "image/jpeg") {
        let ext = image.mimetype.split("/")[1];
        const NewImgName = image.path + "." + ext;
        request.body.image = NewImgName;
        fs.rename(image.path, NewImgName, () => { console.log("uploaded") });
    } else {
        fs.unlink(image.path, () => { console.log("deleted") })
        return response.json({
            status: "not allowed"
        })
    }
}

mongoose.connect('mongodb://127.0.0.1:27017/authentication').then(() => {
    app.listen(3003, () => console.log("server and db running"))
})
