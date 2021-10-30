export interface IProduct {
  name: string;
  category: string;
  image: string;
  price: number;
  brand: string;
  rating: number;
  numReviews: number;
  countInStock: number;
  description: string;
  slug: string;
}

export interface IUser {
  _id?: string;
  token?: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface IData {
  users: IUser[];
  products: IProduct[];
}
