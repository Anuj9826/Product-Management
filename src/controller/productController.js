const productModel = require("../models/productModel");
const {
  isValidRequest,
  isValidString,
  isValidName,
  isValidNum,
  isImageFile,
  isValidId,
} = require("../validator/validation");
const aws = require("../AWS/awsConfig");

const createProduct = async function (req, res) {
  try {
    let data = JSON.parse(JSON.stringify(req.body));
    let files = req.files;

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
    if (isValidRequest(data))
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
        .send({ status: false, message: "Title is in wrong format" });
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
        .send({ status: false, message: "description is in wrong format" });
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

    if (isValidName(currencyFormat)) {
      return res.status(400).send({
        status: false,
        message: " currencyFormat should not be an empty string",
      });
    }

    if (currencyFormat !== "₹") {
      return res.status(400).send({
        status: false,
        message: " currencyFormat should be in '₹' Format",
      });
    }

    if (isFreeShipping && !isValidBoolean(isFreeShipping)) {
      if (validate.isValidName(isFreeShipping))
        return res.status(400).send({
          status: false,
          message: " isFreeShipping should not be empty",
        });
      if (typeof data.isFreeShipping == "string") {
        //converting it to lowercase and removing white spaces
        data.isFreeShipping = isFreeShipping.toLowerCase().trim();
        if (isFreeShipping == "true" || isFreeShipping == "false") {
          //converting from string to boolean
          data.isFreeShipping = JSON.parse(data.isFreeShipping);
        } else {
          return res.status(400).send({
            status: false,
            message: "Enter a boolean value for isFreeShipping",
          });
        }
      }
    }

    //checking for image link
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
      updateUserData.profileImage = uploadedFileURL;
    }

    //checking for style in data
    if (style) {
      if (isValidName(style) && isValidNameString(style))
        return res.status(400).send({
          status: false,
          message: "Style should be valid an does not contain numbers",
        });
    }

    if (!availableSizes)
      return res
        .status(400)
        .send({ status: false, message: " availableSizes is Required" });

    //checking for available Sizes of the products
    if (availableSizes) {
      let size = availableSizes.toUpperCase().split(", "); //creating an array
      data.availableSizes = size;
    }

    for (let i = 0; i < data.availableSizes.length; i++) {
      if (!validate.isValidNameSize(data.availableSizes[i])) {
        return res.status(400).send({
          status: false,
          message:
            "Size should be one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'",
        });
      }
    }

    if (installments && !isValidNum(installments)) {
      res
        .status(400)
        .send({ status: false, message: "please enter valid installments" });
      return;
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
    let obj = {};

    if (data.name != undefined) {
      obj.title = data.name;
    }
    if (data.size != undefined) {
      obj.availableSizes = data.size.toUpperCase();
    }
    if (data.priceGreaterThan != undefined) {
      obj.price = { $gt: data.priceGreaterThan };
    }
    if (data.priceLessThan != undefined) {
      obj.price = { $lt: data.priceLessThan };
    }

    obj.isDeleted = false;

    const productData = await productModel
      .find(obj)
      .sort({ price: 1 })
      .select({ deletedAt: 0 });

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

    let productDetails = await productModel.findById({ _id: id });

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

//============================ Delete by ID ==============>

const deletebyId = async function (req, res) {
  try {
    let product = req.params.productId;
    if (!isValidId(product)) {
      res
        .status(400)
        .send({ status: false, message: "Please provide valid Product Id" });
    }
    let getId = await productModel.findOne({ _id: product, isDeleted: false });

    if (getId == null) {
      return res.status(404).send({
        status: false,
        message: "Product does not exist or product already deleted",
      });
    }
    await productModel.findOneAndUpdate(
      { _id: product },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Product is deleted" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createProduct, getProduct, getProductById, deletebyId };
