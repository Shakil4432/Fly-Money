import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { Order } from "../order/order.model";
import User from "../user/user.model";
import { Product } from "../product/product.model";
import { Payment } from "../payment/payment.model";

const getMetaData = async (query: Record<string, unknown>) => {
  const { startDate, endDate } = query;

  // Global stats
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const totalPayments = await Payment.countDocuments();

  const paymentStatusCounts = await Payment.aggregate([
    { $group: { _id: "$status", totalPayments: { $sum: 1 } } },
    { $project: { status: "$_id", totalPayments: 1, _id: 0 } },
  ]);

  // Pie Chart: Revenue by category
  const pieChartData = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product.parentCategory",
        total: {
          $sum: { $multiply: ["$products.unitPrice", "$products.quantity"] },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $project: {
        category: { $arrayElemAt: ["$categoryInfo.name", 0] },
        totalAmount: "$total",
        _id: 0,
      },
    },
  ]);

  // Bar Chart: Orders per month
  const barChartData = await Order.aggregate([
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalOrders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        totalOrders: 1,
        _id: 0,
      },
    },
  ]);

  // Line Chart: Sales over time
  const lineChartData = await Order.aggregate([
    ...(startDate && endDate
      ? [
          {
            $match: {
              createdAt: {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string),
              },
            },
          },
        ]
      : []),
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", totalSales: 1, _id: 0 } },
  ]);

  // Today's sales
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todaysSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
  ]);

  const todaysSalesAmount = todaysSales[0]?.totalSales || 0;

  return {
    totalUsers,
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
    totalPayments,
    paymentStatusCounts,
    pieChartData,
    barChartData,
    lineChartData,
    todaysSalesAmount,
  };
};

const getOrdersByDate = async (
  startDate: string,
  endDate?: string,
  groupBy?: string
) => {
  console.log({ startDate });

  if (startDate && !endDate) {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.date": startDate,
        },
      },
    ]);

    if (orders.length === 0) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "No orders found for the given date"
      );
    }

    return orders;
  }

  if (startDate && endDate) {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ]);

    if (orders.length === 0) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "No orders found for the given date range"
      );
    }

    return orders;
  }

  if (startDate && endDate && groupBy === "week") {
  }
};

export const MetaService = {
  getMetaData,
  getOrdersByDate,
};
