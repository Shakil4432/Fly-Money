import { FilterQuery, Query } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, any>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, any>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            } as FilterQuery<T>)
        ),
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "minPrice",
      "maxPrice",
      "minOfferPrice",
      "maxOfferPrice",
      "availableColors",
      "brand",
      "parentCategory",
      "subCategory",
      "thirdSubCategory",
      "minRating",
      "maxRating",
      "minStock",
      "maxStock",
      "isActive",
    ];

    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  filterByCategories() {
    const { parentCategory, subCategory, thirdSubCategory } = this.query;

    const categoryFilter: Record<string, any> = {};
    if (parentCategory) categoryFilter["parentCategory"] = parentCategory;
    if (subCategory) categoryFilter["subCategory"] = subCategory;
    if (thirdSubCategory) categoryFilter["thirdSubCategory"] = thirdSubCategory;

    this.modelQuery = this.modelQuery.find(categoryFilter as FilterQuery<T>);
    return this;
  }

  filterByBrandAndColor() {
    const { brand, availableColors } = this.query;

    const filter: Record<string, any> = {};
    if (brand) filter["brand"] = { $regex: new RegExp(`^${brand}$`, "i") };

    if (availableColors) {
      const colorsArray = Array.isArray(availableColors)
        ? availableColors
        : [availableColors];
      filter["availableColors"] = {
        $in: colorsArray.map((color) => new RegExp(`^${color}$`, "i")),
      };
    }

    this.modelQuery = this.modelQuery.find(filter as FilterQuery<T>);
    return this;
  }

  priceRange(minPrice: number, maxPrice: number) {
    const priceFilter: Record<string, any> = {};
    console.log(minPrice, maxPrice);

    if (minPrice !== undefined) priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined) priceFilter.$lte = Number(maxPrice);

    if (Object.keys(priceFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  offerPriceRange() {
    const { minOfferPrice, maxOfferPrice } = this.query;
    console.log(minOfferPrice, maxOfferPrice);
    const offerFilter: any = {};

    if (minOfferPrice !== undefined) offerFilter.$gte = Number(minOfferPrice);
    if (maxOfferPrice !== undefined) offerFilter.$lte = Number(maxOfferPrice);

    if (Object.keys(offerFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        offerPrice: offerFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  ratingRange() {
    const { minRating, maxRating } = this.query;
    const ratingFilter: any = {};

    if (minRating !== undefined) ratingFilter.$gte = Number(minRating);
    if (maxRating !== undefined) ratingFilter.$lte = Number(maxRating);

    if (Object.keys(ratingFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        averageRating: ratingFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  stockRange() {
    const { minStock, maxStock } = this.query;
    const stockFilter: any = {};

    if (minStock !== undefined) stockFilter.$gte = Number(minStock);
    if (maxStock !== undefined) stockFilter.$lte = Number(maxStock);

    if (Object.keys(stockFilter).length > 0) {
      this.modelQuery = this.modelQuery.find({
        stock: stockFilter,
      } as FilterQuery<T>);
    }

    return this;
  }

  isActiveFilter() {
    const { isActive } = this.query;

    if (isActive !== undefined) {
      const activeValue =
        typeof isActive === "string" ? isActive === "true" : Boolean(isActive);
      this.modelQuery = this.modelQuery.find({
        isActive: activeValue,
      } as FilterQuery<T>);
    }

    return this;
  }

  sort() {
    const sort =
      (this.query?.sort as string)?.split(",")?.join(" ") || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(",")?.join(" ") || "-__v";

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalFilter = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalFilter);
    const page = Number(this?.query?.page) || 1;
    const limit = Number(this?.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
