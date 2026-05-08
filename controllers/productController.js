import Product from "../models/Product.js";

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    let products = Product.find(query);
    if (sort === "price-asc") products = products.sort({ price: 1 });
    if (sort === "price-desc") products = products.sort({ price: -1 });

    const result = await products;

    res.status(200).json({
      success: true,
      count: result.length,
      products: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
};
