export interface Product {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  shortDescription?: string;
  image?: {
    sourceUrl: string;
    altText: string;
  };
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  stockQuantity?: number;
  galleryImages?: {
    nodes: {
      sourceUrl: string;
      altText: string;
    }[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  stockStatus: string;
  stockQuantity?: number;
  attributes: {
    nodes: {
      name: string;
      value: string;
    }[];
  };
}

export interface ProductAttribute {
  name: string;
  options: string[];
}

export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  subtotal: string;
  product: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      slug: string;
      image: {
        sourceUrl: string;
        altText: string;
      };
      price: string;
    };
  };
  variation?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      price: string;
    };
  };
}

export interface Cart {
  contents: {
    nodes: CartItem[];
  };
  subtotal: string;
  total: string;
  isEmpty: boolean;
}

export interface SliderImage {
  id: string;
  title?: string;
  acfSlider?: {
    image?: {
      node: {
        sourceUrl: string;
        altText: string;
      };
    };
    title?: string;
    subtitle?: string;
    link?: string;
    buttonText?: string;
  };
}
