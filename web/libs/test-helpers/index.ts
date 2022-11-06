import { faker } from "@faker-js/faker";
import { addHours } from "date-fns";
import * as Product from "../../database/models/product";
import { Model as Schedule } from "../../database/models/schedule";
import { Model as Staff } from "../../database/models/staff";

export const createStaff = async () => {
  return await Staff.create({
    shop: global.shop,
    fullname: faker.name.fullName(),
    email: faker.internet.email(),
    phone: "+4531317411",
  });
};

export const createProduct = async ({
  shopifyProductId,
  duration = 45,
  buffertime = 15,
}) => {
  return await Product.Model.create({
    shop: global.shop,
    collectionId: faker.name.jobTitle(),
    productId: shopifyProductId,
    title: faker.company.name(),
    duration,
    buffertime,
  });
};

export const createSchedule = async ({
  staff,
  tag,
  start = new Date(),
  end = addHours(new Date(), 5),
}) => {
  return await Schedule.create({
    tag,
    staff,
    start,
    end,
  });
};

export const createNewStaffAndAddToProductWithSchedule = async ({
  product,
  tag,
}) => {
  const staff = await createStaff();

  const updateProduct = await Product.addStaff({
    id: product._id.toString(),
    shop: global.shop,
    staff: staff._id.toString(),
    tag: tag,
  });

  const schedule = await createSchedule({
    tag,
    staff: staff._id.toString(),
  });

  return { staff, updateProduct, schedule };
};

export const addStaffToProduct = async ({ staff, product, tag }) => {
  const updateProduct = await Product.addStaff({
    id: product._id.toString(),
    shop: global.shop,
    staff: staff._id.toString(),
    tag: tag,
  });

  return { updateProduct };
};
