const productModel = require("../models/productModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidNum,
  isImageFile,
  isValidId,
  isSize,
  isValidPrice,
  isValidBoolean,
  isValidSize,
} = require("../validator/validation");
const { uploadFile } = require("../AWS/awsConfig");

const createProduct = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    

    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    //checking for the valid data
    if (!isValidRequest(data))
      return res
        .status(400)
        .send({ status: false, message: "Please provide data in body" });

    //validating the data
    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "Title is Required" });
    }

    if (!isValidName(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Title is not valid" });
    }

    //checking for duplicate title
    let duplicateTitle = await productModel.findOne({ title: title });
    if (duplicateTitle) {
      return res
        .status(400)
        .send({ status: false, message: "Title already exist" });
    }
    if (!description) {
      return res
        .status(400)
        .send({ status: false, message: "Description is Required" });
    }

    if (!isValidName(description)) {
      return res
        .status(400)
        .send({ status: false, message: "description is not valid" });
    }

    if (!price) {
      return res
        .status(400)
        .send({ status: false, message: "price is Required" });
    }

    if (!(isValidPrice(price) || typeof parseInt(price) !== "number")) {
      return res.status(400).send({
        status: false,
        message: "Price of product should be valid and in numbers",
      });
    }

    if (!currencyId) {
      return res
        .status(400)
        .send({ status: false, message: "currencyId is Required" });
    }

    if (!isValidString(currencyId)) {
      return res.status(400).send({
        status: false,
        message: " currencyId should not be an empty string",
      });
    }
    if (currencyId !== "INR") {
      return res.status(400).send({
        status: false,
        message: " currencyId should be in 'INR' Format",
      });
    }

    if (!currencyFormat) {
      return res
        .status(400)
        .send({ status: false, message: "currencyFormat is Required" });
    }

    if (!isValidString(currencyFormat)) {
      return res.status(400).send({
        status: false,
        message: " currencyFormat should not be an empty ",
      });
      
    }

    if (currencyFormat !== "₹") {
      return res.status(400).send({
        status: false,
        message: " currencyFormat should be in '₹' Format",
      });
    }
    if(isFreeShipping && !isValidBoolean(isFreeShipping)){
      return res.status(400).send({ 
        status: false, 
        message: "free shipping type is not correct" });
    }

    //checking for image link
    let files = req.files;
    if (files.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "ProductImage is required" });
    
    if (files.length) {
      if (!isImageFile(files[0].originalname)) {
        return res
          .status(400)
          .send({ status: false, message: "File extension not supported!" });
      }
      //getting the AWS-S3 link after uploading the user's profileImage
      let uploadedFileURL = await uploadFile(files[0]);
      data.productImage = uploadedFileURL;
    }

    //checking for style in data
    if(!style){
      return res
        .status(400)
        .send({ status: false, message: "Style is Required" });
      
    }
    if (!isValidName(style)){
      return res.status(400).send({
        status: false,
        message: "Style should be valid an does not contain numbers",
      });
    }
        

    if(!availableSizes){
      return res
        .status(400)
        .send({ status: false, message: " AvailableSizes is Required" });
    }
      
    if(!isValidSize(availableSizes)){
      return res.status(400).send({
        status: false,
        message: `Size Must be of these values ---> "S", "XS","M","X", "L","XXL", "XL" `,
      });
    }
    availableSizes = availableSizes.split(",").map((x) => x.trim());
    data.availableSizes = availableSizes

    if (installments && !isValidNum(installments)) {
      return res
        .status(400)
        .send({ status: false, message: "please enter valid installments" });
      
    }

    let createProduct = await productModel.create(data);
    return res
      .status(201)
      .send({ status: false, message: "Success", data: createProduct });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// <=================================> get product  <===============================================>
const getProduct = async function (req, res) {
  try {
    let data = req.query;
    let {size, name, priceGreaterThan, priceLessThan, priceShort, ...obj} = data

    if(!isValidRequest(obj)){
      return res.status(400).send({
        status: false,
        message: "Bad filter object"
      })
    }
    let filterName = {}
    if(size){
      if(size && isSize(size)){
        res.status(400).send({
          status: false,
          message: "Size must be S, XS, M, L, X, XL, XXL"
        })
      }
      size = size.toUpperCase();
      filterName.availableSizes = {$in: size};
    }
    if(name){
      if(name && !isValidString(name)){
        return res.status(400).send({
          status: false,
          message: "Name is not valid"
        })
      }
      filterQuery.title = { $regex: name, $options: "i" };
    }
    if(priceGreaterThan || priceLessThan){
      let filter = {};
      if(priceGreaterThan){
        if(priceGreaterThan && !isValidNum(priceGreaterThan)){
          return res.status(400).send({
            status: false,
            message: "Please enter valid greater than price"
          })
        }
        filter.$gt = priceGreaterThan
      }
      if(priceLessThan){
        if(priceLessThan && !isValidNum(priceLessThan)){
          return res.status(400).send({
            status: false,
            message: "Please enter valid less than price"
          })
        }
        filter.$lt = priceLessThan
      }
      filterName.price = filter;
    }

    let shortFilter = {}
    shortFilter.price = 1;

    if(priceShort){
      if(priceShort && !["1", "-1"].includes(priceShort)){
        return res.status(400).send({
          status: false,
          message: "Please enter valid shorting"
        })
      }
      shortFilter.price = parseInt(priceShort)
    }
    
    let checkProduct = {isDeleted: false}
    let copyData = Object.assign(filterName, checkProduct) // The Object.assign() method copies all enumerable own properties from one or more source objects to a target object.
    const productData = await productModel
      .find(copyData)
      .collation({locale: "en"})   //Collation allows users to specify language-specific rules for string comparison
      .sort(shortFilter)
      

    if (productData.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: "No product found" });
    }

    return res
      .status(200)
      .send({ status: true, message: "Success", data: productData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//<================================> getProductById <=============================================>

const getProductById = async function (req, res) {
  try {
    let id = req.params.productId;
    if (!isValidId(id)) {
      return res
        .status(404)
        .send({ status: false, message: "Please enter valid product id" });
    }

    let productDetails = await productModel.findById(productId);

    if (!productDetails || productDetails.isDeleted == true) {
      return res
        .status(404)
        .send({
          status: false,
          message: "Product not found or Product is already deleted",
        });
    }
    return res
      .status(200)
      .send({ status: true, message: "Product list", data: productDetails });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// <============================> Update product <============================>

const updateProduct = async function(req, res){
  try {
    let productId = req.params.productId

    if(!isValidId(productId)){
      return res.status(400).send({
        status: false,
        message: "Product Id is not Valid"
      })
    }
    let productDetails = await productModel.findById(productId)

    if(!productDetails || productDetails.isDeleted == true){
      return res.status(400).send({
        status: false,
        message: "Product does not exist"
      })
    }

    let data = {...req.body} 

    if(!isValidRequest(data)){
      return res.status(400).send({
        status: false,
        message: "Please provide data to update the product"
      })
    }

    let {title,description,price,isFreeShipping,style,availableSizes,installments} = data

    let updateProductDetails = {}
    if(data.hasOwnProperty("title")){
      if(!isValidName(title)){
        return res.status(400).send({
          status: false,
          message: "Please enter a valid title"
        })
      }
      updateProductDetails.title = data.title
    }
    
    let duplicateTitle = await productModel.findOne({
      title: title,
      isDeleted:false
    })
    if(duplicateTitle){
      return res.status(400).send({
        status:false,
        message: "This title already exist "
      })
    }

    if(data.hasOwnProperty("description")){
      if(!isValidName(description)){
        return res.status(400).send({
          status: false,
          message: "Please enter a valid description"
        })
      }
      updateProductDetails.description = data.description
    }
    if(data.hasOwnProperty("price")){
      if(!isValidPrice(price)){
        return res.status(400).send({
          status: false,
          message: "Please enter a valid price"
        })
      }
      updateProductDetails.price = data.price
    }

    if(data.hasOwnProperty("isFreeShipping")){
      if(!isValidBoolean(isFreeShipping)){
        return res.status(400).send({
          status: false,
          message: "Please enter a valid isFreeShipping value"
        })
      }
      updateProductDetails.isFreeShipping = data.isFreeShipping
    }

    let files = req.files

    if(files.length){
      if(!isImageFile(files[0].originalname)){
        return res.status(400).send({
          status: false,
          message: "File extension not supported!"
        })
      }
      let uploadedFileURL = await uploadFile(files[0]);
      updateProductDetails.productImage = uploadedFileURL
    }

    if(data.hasOwnProperty("style")){
      if(!isValidName(style)){
        return res.status(400).send({
          status: false,
          message: "Please enter a valid style"
        })
      }
      updateProductDetails.style = data.style
    }

  let product = await productModel.findById({_id:productId}).select({_id:0, availableSizes:1})
  let existSizes = product.availableSizes
   //console.log("alreday present sizes "+ existSizes)
  if (data.hasOwnProperty("availableSizes")) {
    if (availableSizes) {
      let sizes = availableSizes.split(" ").map((x) => x.trim());
       //console.log(sizes)
      sizes.forEach((size) => {
        if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size)) {
          return res.status(400).send({

            status: false,
            message: `Available sizes must be among ${[
                "S",
                "XS",
                "M",
                "X",
                "L",
                "XXL",
                "XL",
              ]} and this format S M L X XL XXL XS`,
            });
        }
         //productDetails["availableSizes"] = sizes;
        sizes.forEach((size)=>{
          if(!existSizes.includes(size)){
            existSizes.push(size)
          }else{
            
           }
         })
         updateProductDetails.availableSizes=existSizes
       });
      
     }
   }

    // if(data.hasOwnProperty("availableSizes")){
    //   if(!isValidSize(availableSizes)){
    //     return res.status(400).send({
    //       status: false,
    //       message: "Size must be S, XS, M, L, X, XL, XXL"
    //     })
    //   }
    //   updateProductDetails.availableSizes = isValidSize(availableSizes)
    // }

    if(data.hasOwnProperty("installments")){
      if(!isValidNum(installments)){
        return res.status(400).send({
          status: false,
          message: "Instalment must be a number"
        })
      }
      updateProductDetails.installments = data.installments
    }

    if(data.hasOwnProperty("isDeleted")){
      return res.status(400).send({
        status: false,
        message: "You can't update isDeleted value"
      })
    }

    let updateProduct = await productModel.findOneAndUpdate(
      {_id: productId},
      updateProductDetails,
      {new: true}
    );
    res.status(200).send({
      status: true,
      message: "Product details updated",
      data: updateProduct,
    });
  
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
}

//============================ Delete by ID ==============>

const deleteById = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!isValidId(productId)) {
      res
        .status(400)
        .send({ status: false, message: "Please provide valid Product Id" });
    }
    let product = await productModel.findOne({ _id: productId, isDeleted: false });

    if (product == null) {
      return res.status(404).send({
        status: false,
        message: "Product does not exist or product already deleted",
      });
    }
    await productModel.findOneAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, deletedAt: new Date().toISOString() } },
      { new: true, upsert: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Product is deleted" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createProduct, getProduct, getProductById, updateProduct, deleteById };
