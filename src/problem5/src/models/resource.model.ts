import mongoose, { Schema, Document } from 'mongoose';

/**
 * @openapi
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         owner:
 *           type: string
 *         type:
 *           type: string
 *         details:
 *           type: string
 *         amount:
 *           type: number
 *
 */
export interface IResource extends Document {
  owner: string;
  type: string;
  details: string;
  amount: number;
}

const ResourceSchema: Schema = new Schema(
  {
    owner: { type: String, required: true },
    type: { type: String, required: true },
    details: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IResource>('Resource', ResourceSchema);
