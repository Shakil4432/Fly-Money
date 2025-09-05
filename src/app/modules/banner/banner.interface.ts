export interface IBanner {
  title: string; // banner title
  subtitle?: string; // optional subtitle
  imageUrl: string; // main banner image
  link?: string; // redirect link (optional)
  isActive: boolean; // show/hide banner
  position?: number; // order of banner display
  createdAt?: string;
  updatedAt?: string;
}
