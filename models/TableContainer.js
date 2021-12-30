import mongoose from "mongoose";

const { Schema } = mongoose;

const TableSchema = new Schema({
  table: String,
  no: String,
  effectiveDate: String,
  rates: [
    {
      currency: String,
      code: String,
      mid: Number,
    },
  ],
});

const TableContainerSchema = new Schema({
  key: String,
  tables: [TableSchema],
});

export default mongoose.model("TableContainer", TableContainerSchema);
